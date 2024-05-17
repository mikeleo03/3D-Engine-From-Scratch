import {SceneNode} from "@/lib/data/SceneNode";
import {Quaternion, Vector3} from "@/lib/data/math";
import { GLTFParser } from "@/lib/data/GLTFParser";
import { AnimationClipType, AnimationPathType, AnimationTRS } from '../types/gltftypes';


export type AnimationPath = {
  keyframe?: AnimationTRS;
  children?: SceneNode[];
}

export type AnimationClip = {
  name: string;
  frames: AnimationPath[];
}

export class AnimationPathUtil {
  static fromRaw(raw: AnimationPathType, nodes: SceneNode[]): AnimationPath {
      return {
        keyframe: raw.keyframe,
        children: raw.children ? raw.children.map(child => nodes[child]) : undefined,
      }
  }

  static toRaw(path: AnimationPath, nodeMap: Map<SceneNode, number>): AnimationPathType {
    const children = path.children ? path.children.map(child => nodeMap.get(child)!!) : undefined;
    return {
      keyframe: path.keyframe,
      children: children
    }
  }

}

export class AnimationClipUtil {
  static fromRaw(raw: AnimationClipType, nodes: SceneNode[]): AnimationClip {
    return {
      name: raw.name,
      frames: raw.frames.map(frame => AnimationPathUtil.fromRaw(frame, nodes)),
    }
  }

  static toRaw(clip: AnimationClip, nodeMap: Map<SceneNode, number>): AnimationClipType {
    return {
      name: clip.name,
      frames: clip.frames.map(frame => AnimationPathUtil.toRaw(frame, nodeMap)),
    }
  }
}

export enum EasingFunction {
  LINEAR = 'Linear',
  SINE = 'Sine',
  QUAD = 'Quad',
  CUBIC = 'Cubic',
  QUART = 'Quart',
  EXPO = 'Expo',
  CIRC = 'Circ',
}

export class AnimationRunner {
  isPlaying: boolean = false;
  isReverse: boolean = false;
  isLoop: boolean = false;
  fps: number = 30;
  easeFunction: EasingFunction = EasingFunction.LINEAR;
  private root: SceneNode;
  private currentFrame: number = 0;
  private deltaFrame: number = 0;
  private currentAnimation?: AnimationClip;

  constructor({fps = 30} = {}) {
    this.fps = fps;
  }

  get CurrentFrame() {
    return this.currentFrame;
  }

  get length() {
    return this.currentAnimation!.frames.length;
  }

  public setAnimation(animation: AnimationClip, root: SceneNode) {
    this.currentAnimation = animation;
    this.root = root;
    this.currentFrame = 0;
    this.deltaFrame = 0;
    this.updateSceneGraph();
  }

  private get frame() {
    return this.currentAnimation!.frames[this.currentFrame];
  }

  private calculateEasing(currentTime: number, startValue: number, changeInValue: number, duration: number): number {
    switch (this.easeFunction) {
      case EasingFunction.SINE: //ease inout
        return changeInValue * Math.sin(currentTime / duration * Math.PI / 2) + startValue;
      case EasingFunction.QUAD: //ease inout
        currentTime /= duration / 2;
        if (currentTime < 1) return changeInValue / 2 * currentTime * currentTime + startValue;
        return -changeInValue / 2 * ((--currentTime) * (currentTime - 2) - 1) + startValue;
      case EasingFunction.CUBIC: //ease inout
        return changeInValue * ((currentTime = currentTime / duration - 1) * currentTime * currentTime + 1) + startValue;
      case EasingFunction.QUART: //ease inout
        return changeInValue * ((currentTime = currentTime / duration - 1) * currentTime * currentTime * currentTime + 1) + startValue;
      case EasingFunction.EXPO: //ease inout
        currentTime /= duration / 2;
        if (currentTime < 1) return changeInValue / 2 * Math.pow(2, 10 * (currentTime - 1)) + startValue;
        return changeInValue / 2 * (-Math.pow(2, -10 * --currentTime) + 2) + startValue;
      case EasingFunction.CIRC: //ease inout
        return changeInValue * (1 - Math.sqrt(1 - (currentTime /= duration) * currentTime)) + startValue;
      default: // linear
        return changeInValue * currentTime / duration + startValue;
    }
  }

  nextFrame() {
    if (this.currentFrame < this.length - 1) {
      this.currentFrame++;
      this.deltaFrame = 0; // ensure that the animation is playing from the start of the frame
      this.updateSceneGraph();
    }
  }

  prevFrame() {
    if (this.currentFrame > 0) {
      this.currentFrame--;
      this.deltaFrame = 0; // ensure that the animation is playing from the start of the frame
      this.updateSceneGraph();
    }
  }

  firstFrame() {
    this.currentFrame = 0;
    this.updateSceneGraph();
  }

  lastFrame() {
    this.currentFrame = this.length - 1;
    this.updateSceneGraph();
  }

  update(deltaSecond: number) {
    if (this.isPlaying) {
      this.deltaFrame = this.calculateEasing(Math.abs(this.currentFrame / this.fps), 0, 1, this.length)
      if (this.deltaFrame >= 1) {
        let newFrame = this.currentFrame + (this.isReverse ? -1 : 1) * Math.floor(this.deltaFrame);
        if (newFrame < 0 || newFrame >= this.length) {
          if (this.isLoop) {
            this.currentFrame = (newFrame + this.length) % this.length;
          } else {
            this.isPlaying = false;
            return;
          }
        } else {
          this.currentFrame = newFrame;
        }
        this.deltaFrame = this.deltaFrame % 1;
        this.updateSceneGraph();
      }
    }
  }

  private updateSceneGraph() {
    // update the scene graph based on the current frame
    const frame = this.frame;
    // use root as the parent and traverse according to the frame
    this.traverseAndUpdate(this.root, frame);
  }

  // TODO: remove the update of the child as well since the child follows the parent (wait for live environment for testing)
  private traverseAndUpdate(node: SceneNode, frame: AnimationPath) {
    // update the node based on the frame
    if (frame.keyframe) {
      if (frame.keyframe.translation) {
        node.position = new Vector3(frame.keyframe.translation[0], frame.keyframe.translation[1], frame.keyframe.translation[2]);
      }
      if (frame.keyframe.rotation) {
        const eulerVec = new Vector3(frame.keyframe.rotation[0], frame.keyframe.rotation[1], frame.keyframe.rotation[2]);
        node.rotation = Quaternion.fromEuler(eulerVec);
      }
      if (frame.keyframe.scale) {
        node.scale = new Vector3(frame.keyframe.scale[0], frame.keyframe.scale[1], frame.keyframe.scale[2]);
      }
    }

    // // recursive approach to apply the frame to the children
    // if (frame.children && node.children) {
    //   for (let i = 0; i < node.children.length; i++) {
    //     const child = node.children[i];
    //     const childFrame = frame.children[i];
    //     if (child && childFrame) {
    //       this.traverseAndUpdate(child, childFrame);
    //     }
    //   }
    // }
  }
}
