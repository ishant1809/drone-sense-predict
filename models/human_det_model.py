# ================================
# 1. IMPORTS
# ================================
import os, json, random, time
import torch
import torch.nn as nn
import torch.optim as optim

from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.models.detection import FasterRCNN
from torchvision.models.detection.rpn import AnchorGenerator
from collections import OrderedDict

# ================================
# 2. YOLO → BOX CONVERSION
# ================================
def load_yolo_annotations(label_path, img_w, img_h):
    boxes, labels = [], []

    if not os.path.exists(label_path):
        return torch.zeros((0,4)), torch.zeros((0,), dtype=torch.int64)

    with open(label_path) as f:
        for line in f:
            vals = line.strip().split()
            if len(vals) < 5:
                continue

            x, y, w, h = map(float, vals[1:5])

            x *= img_w
            y *= img_h
            w *= img_w
            h *= img_h

            boxes.append([x-w/2, y-h/2, x+w/2, y+h/2])
            labels.append(1)

    return torch.tensor(boxes, dtype=torch.float32), torch.tensor(labels, dtype=torch.int64)

# ================================
# 3. DATASET
# ================================
class C2ADataset(Dataset):
    def __init__(self, root, split='train', transform=None, limit=500):
        self.root = root
        self.split = split
        self.transform = transform

        img_dir = os.path.join(root, split, "images")
        ann_path = os.path.join(root, "..", "Coco_annotation_pose",
                                f"{split}_annotations_with_pose_information.json")

        with open(ann_path) as f:
            coco = json.load(f)

        self.imgs = {img['id']: img for img in coco['images']}
        self.ids = list(self.imgs.keys())

        random.shuffle(self.ids)
        self.ids = self.ids[:limit]

        self.img_dir = img_dir
        self.label_dir = os.path.join(root, "..", "C2A_Dataset",
                                     "new_dataset3", "All labels with Pose information", "labels")

    def __len__(self):
        return len(self.ids)

    def __getitem__(self, idx):
        img_id = self.ids[idx]
        info = self.imgs[img_id]

        path = os.path.join(self.img_dir, info['file_name'])
        image = Image.open(path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label_path = os.path.join(
            self.label_dir,
            os.path.splitext(info['file_name'])[0] + ".txt"
        )

        boxes, labels = load_yolo_annotations(label_path, info['width'], info['height'])

        target = {
            "boxes": boxes,
            "labels": labels,
            "image_id": torch.tensor([img_id])
        }

        return image, target

# ================================
# 4. TRANSFORMS
# ================================
transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# ================================
# 5. DATA LOADERS
# ================================
dataset_root = "/content/C2A_Dataset/new_dataset3"

train_dataset = C2ADataset(dataset_root, "train", transform, 500)
val_dataset   = C2ADataset(dataset_root, "val", transform, 500)

train_loader = DataLoader(
    train_dataset,
    batch_size=2,
    shuffle=True,
    num_workers=2,
    pin_memory=True,
    collate_fn=lambda x: tuple(zip(*x))
)

val_loader = DataLoader(
    val_dataset,
    batch_size=1,
    num_workers=2,
    collate_fn=lambda x: tuple(zip(*x))
)

# ================================
# 6. MODEL (CUSTOM BACKBONE)
# ================================
class Backbone(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3,64,3,1,1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64,128,3,1,1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128,256,3,1,1), nn.ReLU(), nn.MaxPool2d(2)
        )

    def forward(self,x):
        return OrderedDict([("0", self.features(x))])

backbone = Backbone()
backbone.out_channels = 256

anchor_gen = AnchorGenerator(
    sizes=((64,),),
    aspect_ratios=((0.5,1.0,2.0),)
)

model = FasterRCNN(backbone, num_classes=2, rpn_anchor_generator=anchor_gen)

# ================================
# 7. DEVICE + OPTIMIZER
# ================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

optimizer = optim.SGD(model.parameters(), lr=0.002, momentum=0.9)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.5)

# ================================
# 8. TRAIN FUNCTION
# ================================
def train_one_epoch():
    model.train()
    total_loss = 0

    for imgs, targets in train_loader:
        imgs = [i.to(device) for i in imgs]
        targets = [{k:v.to(device) for k,v in t.items()} for t in targets]

        loss_dict = model(imgs, targets)
        loss = sum(loss_dict.values())

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    return total_loss / len(train_loader)

# ================================
# 9. VALIDATION
# ================================
def evaluate(loader):
    model.train()
    total = 0

    with torch.no_grad():
        for imgs, targets in loader:
            imgs = [i.to(device) for i in imgs]
            targets = [{k:v.to(device) for k,v in t.items()} for t in targets]

            loss = sum(model(imgs, targets).values())
            total += loss.item()

    return total / len(loader)

# ================================
# 10. TRAIN LOOP
# ================================
num_epochs = 5

for epoch in range(num_epochs):
    start = time.time()

    train_loss = train_one_epoch()
    val_loss = evaluate(val_loader)

    scheduler.step()

    print(f"Epoch {epoch+1}/{num_epochs}")
    print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
    print(f"Time: {time.time() - start:.2f}s\n")

# ================================
# 11. SAVE MODEL
# ================================
torch.save(model.state_dict(), "c2a_model.pth")