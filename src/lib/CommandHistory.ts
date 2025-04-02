import {
  Object3D,
  Vector3,
  Euler,
  Material,
  Color,
  MeshStandardMaterial,
} from "three";

// 命令接口
export interface Command {
  execute(): void;
  undo(): void;
  getType(): string;
}

// 移动物体命令
export class MoveCommand implements Command {
  private oldPosition: Vector3;
  private newPosition: Vector3;

  constructor(private object: Object3D, private position: Vector3) {
    this.oldPosition = object.position.clone();
    this.newPosition = position.clone();
  }

  execute(): void {
    this.object.position.copy(this.newPosition);
  }

  undo(): void {
    this.object.position.copy(this.oldPosition);
  }

  getType(): string {
    return "MOVE";
  }
}

// 旋转物体命令
export class RotateCommand implements Command {
  private oldRotation: Euler;
  private newRotation: Euler;

  constructor(private object: Object3D, private rotation: Euler) {
    this.oldRotation = object.rotation.clone();
    this.newRotation = rotation.clone();
  }

  execute(): void {
    this.object.rotation.copy(this.newRotation);
  }

  undo(): void {
    this.object.rotation.copy(this.oldRotation);
  }

  getType(): string {
    return "ROTATE";
  }
}

// 缩放物体命令
export class ScaleCommand implements Command {
  private oldScale: Vector3;
  private newScale: Vector3;

  constructor(private object: Object3D, private scale: Vector3) {
    this.oldScale = object.scale.clone();
    this.newScale = scale.clone();
  }

  execute(): void {
    this.object.scale.copy(this.newScale);
  }

  undo(): void {
    this.object.scale.copy(this.oldScale);
  }

  getType(): string {
    return "SCALE";
  }
}

// 添加物体命令
export class AddObjectCommand implements Command {
  constructor(private object: Object3D, private parent: Object3D) {}

  execute(): void {
    this.parent.add(this.object);
  }

  undo(): void {
    this.parent.remove(this.object);
  }

  getType(): string {
    return "ADD_OBJECT";
  }
}

// 删除物体命令
export class RemoveObjectCommand implements Command {
  private index: number = -1;

  constructor(private object: Object3D, private parent: Object3D) {}

  execute(): void {
    // 保存索引以便重新添加
    this.index = this.parent.children.indexOf(this.object);
    this.parent.remove(this.object);
  }

  undo(): void {
    if (this.index !== -1) {
      // 尝试在原始位置添加回对象
      this.parent.children.splice(this.index, 0, this.object);
      this.object.parent = this.parent;
    } else {
      this.parent.add(this.object);
    }
  }

  getType(): string {
    return "REMOVE_OBJECT";
  }
}

// 设置材质属性命令
export class SetMaterialValueCommand implements Command {
  private oldValue: any;
  private newValue: any;

  constructor(
    private material: MeshStandardMaterial | Material,
    private propertyName: string,
    private value: any
  ) {
    const materialAny = material as any;

    // 处理特殊情况如颜色
    if (propertyName === "color" && materialAny.color instanceof Color) {
      this.oldValue = materialAny.color.clone();
      this.newValue = new Color(value);
    } else {
      this.oldValue = materialAny[propertyName];
      this.newValue = value;
    }
  }

  execute(): void {
    const materialAny = this.material as any;

    if (this.propertyName === "color" && materialAny.color instanceof Color) {
      materialAny.color.copy(this.newValue);
    } else {
      materialAny[this.propertyName] = this.newValue;
    }
    this.material.needsUpdate = true;
  }

  undo(): void {
    const materialAny = this.material as any;

    if (this.propertyName === "color" && materialAny.color instanceof Color) {
      materialAny.color.copy(this.oldValue);
    } else {
      materialAny[this.propertyName] = this.oldValue;
    }
    this.material.needsUpdate = true;
  }

  getType(): string {
    return "SET_MATERIAL";
  }
}

// 设置可见性命令
export class SetVisibilityCommand implements Command {
  private oldValue: boolean;

  constructor(private object: Object3D, private visible: boolean) {
    this.oldValue = object.visible;
  }

  execute(): void {
    this.object.visible = this.visible;
  }

  undo(): void {
    this.object.visible = this.oldValue;
  }

  getType(): string {
    return "SET_VISIBILITY";
  }
}

// 历史记录管理器
export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number = 50; // 历史记录的最大长度
  private onHistoryChange: () => void = () => {};

  constructor(maxHistorySize?: number) {
    if (maxHistorySize) {
      this.maxHistorySize = maxHistorySize;
    }
  }

  // 执行命令
  execute(command: Command): void {
    this.undoStack.push(command);
    command.execute();

    // 清空重做栈
    this.redoStack = [];

    // 如果历史记录超出大小，删除最旧的命令
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.onHistoryChange();
  }

  // 撤销
  undo(): void {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    this.onHistoryChange();
  }

  // 重做
  redo(): void {
    if (this.redoStack.length === 0) return;

    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);

    this.onHistoryChange();
  }

  // 清除历史
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];

    this.onHistoryChange();
  }

  // 检查是否可以撤销
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  // 检查是否可以重做
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // 设置历史变化的回调
  setOnHistoryChange(callback: () => void): void {
    this.onHistoryChange = callback;
  }

  // 获取撤销栈大小
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  // 获取重做栈大小
  getRedoStackSize(): number {
    return this.redoStack.length;
  }
}
