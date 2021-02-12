/**
 * Interfaces for basic data structures.
 */
import {Modifiable} from './adaptive';

export type IncrList<T> = Modifiable<Pair<T> | null>;

export interface Pair<T> {
  readonly value: T;
  readonly tail: IncrList<T>;
}

export type IncrTree<T> = Modifiable<TreeNode<T> | null>;
interface TreeNode<T> {
  readonly value: T;
  readonly left: IncrTree<T>;
  readonly right: IncrTree<T>;
}
