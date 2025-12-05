export enum AlgoCategory {
  Sorting = 'Sorting',
  Searching = 'Searching',
  DataStructure = 'Data Structure',
  Tree = 'Tree',
  Graph = 'Graph',
}

export enum AlgorithmName {
  BubbleSort = 'Bubble Sort',
  SelectionSort = 'Selection Sort',
  InsertionSort = 'Insertion Sort',
  MergeSort = 'Merge Sort',
  QuickSort = 'Quick Sort',
  HeapSort = 'Heap Sort',
  ShellSort = 'Shell Sort',
  LinearSearch = 'Linear Search',
  BinarySearch = 'Binary Search',
  StackOps = 'Stack Operations',
  QueueOps = 'Queue Operations',
  Inorder = 'Inorder Traversal',
  Preorder = 'Preorder Traversal',
  Postorder = 'Postorder Traversal',
  BFS = 'Breadth-First Search',
  DFS = 'Depth-First Search',
}

export interface SimulationStep {
  data: number[];
  comparedIndices: number[]; // Indices currently being compared or active
  swappedIndices: number[]; // Indices just swapped or modified
  sortedIndices: number[]; // Indices confirmed sorted or finalized
  pivotIndex?: number; // For QuickSort
  description: string; // Text description of step
  codeLine?: number; // Highlighted line of pseudo-code
  auxiliaryData?: number[]; // For things like Merge Sort auxiliary array or Stack/Queue visualization state if distinct
  graphAdjacency?: number[][]; // Adjacency list for graph algorithms [[1,2], [0,3], ...]
}

export interface AlgorithmDef {
  name: AlgorithmName;
  category: AlgoCategory;
  description: string;
  defaultData: number[];
  pseudoCode: string;
  complexity: {
    time: string;
    space: string;
  };
  generator: (data: number[], target?: number) => Generator<SimulationStep>;
}