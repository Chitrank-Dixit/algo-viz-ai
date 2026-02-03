
export enum AlgoCategory {
  Sorting = 'Sorting',
  Searching = 'Searching',
  DataStructure = 'Data Structure',
  Tree = 'Tree',
  Graph = 'Graph',
  Array = 'Array Operations',
  Math = 'Mathematical Algorithms',
}

export enum AlgorithmName {
  BubbleSort = 'Bubble Sort',
  SelectionSort = 'Selection Sort',
  InsertionSort = 'Insertion Sort',
  MergeSort = 'Merge Sort',
  QuickSort = 'Quick Sort',
  HeapSort = 'Heap Sort',
  ShellSort = 'Shell Sort',
  RadixSort = 'Radix Sort',
  LinearSearch = 'Linear Search',
  BinarySearch = 'Binary Search',
  StackOps = 'Stack Operations',
  QueueOps = 'Queue Operations',
  LinkedList = 'Linked List Operations',
  Inorder = 'Inorder Traversal',
  Preorder = 'Preorder Traversal',
  Postorder = 'Postorder Traversal',
  BFS = 'Breadth-First Search',
  DFS = 'Depth-First Search',
  Dijkstra = 'Dijkstra Shortest Path',
  PrimMST = 'Prim\'s MST',
  KruskalMST = 'Kruskal\'s MST',
  LeftRotate = 'Left Array Rotation',
  RightRotate = 'Right Array Rotation',
  Sieve = 'Sieve of Eratosthenes',
}

export interface SimulationStep {
  data: number[];
  comparedIndices: number[]; // Indices currently being compared or active
  swappedIndices: number[]; // Indices just swapped or modified
  sortedIndices: number[]; // Indices confirmed sorted or finalized
  pivotIndex?: number; // For QuickSort or rotating element index
  description: string; // Text description of step
  codeLine?: number; // Highlighted line of pseudo-code
  auxiliaryData?: number[]; // For things like Merge Sort auxiliary array or Buffer element
  graphAdjacency?: number[][]; // Adjacency list for graph algorithms [[1,2], [0,3], ...]
  edgeWeights?: Record<string, number>; // Weights for graph edges, key e.g., "0-1"
  mstEdges?: string[]; // Specifically for MST algorithms, e.g., ["0-1", "1-2"]
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
