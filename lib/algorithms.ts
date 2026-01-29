
import { AlgorithmName, SimulationStep, AlgoCategory } from '../types';

// Helper to create a step object
const createStep = (
  data: number[],
  comparedIndices: number[] = [],
  swappedIndices: number[] = [],
  sortedIndices: number[] = [],
  description: string = '',
  pivotIndex?: number,
  auxiliaryData?: number[],
  graphAdjacency?: number[][]
): SimulationStep => ({
  data: [...data],
  comparedIndices,
  swappedIndices,
  sortedIndices,
  description,
  pivotIndex,
  auxiliaryData: auxiliaryData ? [...auxiliaryData] : undefined,
  graphAdjacency: graphAdjacency ? JSON.parse(JSON.stringify(graphAdjacency)) : undefined,
});

// Helper to generate a deterministic graph (Adjacency List) based on node count
const generateGraph = (n: number): number[][] => {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    adj[i].push(next);
    adj[next].push(i);
  }
  if (n > 4) {
      const addEdge = (u: number, v: number) => {
          if (!adj[u].includes(v)) adj[u].push(v);
          if (!adj[v].includes(u)) adj[v].push(u);
      };
      addEdge(0, Math.floor(n/2));
      addEdge(1, Math.floor(n/2) + 1);
  }
  return adj.map(row => row.sort((a,b) => a - b));
};

export const ALGORITHMS: Record<string, any> = {
  [AlgorithmName.BubbleSort]: {
    name: AlgorithmName.BubbleSort,
    category: AlgoCategory.Sorting,
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    defaultData: [64, 34, 25, 12, 22, 11, 90, 5],
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: `for i from 0 to N-1:
  for j from 0 to N-i-1:
    if A[j] > A[j+1]:
      swap(A[j], A[j+1])`,
    generator: function* (initialData: number[]) {
      let arr = [...initialData];
      let n = arr.length;
      let sortedIndices: number[] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          yield createStep(arr, [j, j + 1], [], sortedIndices, `Comparing ${arr[j]} and ${arr[j + 1]}`);
          if (arr[j] > arr[j + 1]) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            yield createStep(arr, [j, j + 1], [j, j + 1], sortedIndices, `Swapping ${arr[j]} and ${arr[j + 1]}`);
          }
        }
        sortedIndices.push(n - i - 1);
        yield createStep(arr, [], [], sortedIndices, `Element ${arr[n - i - 1]} is sorted`);
      }
      yield createStep(arr, [], [], Array.from({ length: n }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.SelectionSort]: {
    name: AlgorithmName.SelectionSort,
    category: AlgoCategory.Sorting,
    description: 'Divides the input list into two parts: a sorted sublist of items which is built up from left to right.',
    defaultData: [64, 25, 12, 22, 11],
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: `for i from 0 to N-1:
  min_idx = i
  for j from i+1 to N:
    if A[j] < A[min_idx]:
      min_idx = j
  swap(A[i], A[min_idx])`,
    generator: function* (initialData: number[]) {
        let arr = [...initialData];
        let n = arr.length;
        let sortedIndices: number[] = [];
        for (let i = 0; i < n; i++) {
            let min_idx = i;
            yield createStep(arr, [i, min_idx], [], sortedIndices, `Current minimum starts at index ${i}`);
            for (let j = i + 1; j < n; j++) {
                yield createStep(arr, [j, min_idx], [], sortedIndices, `Comparing ${arr[j]} with current min ${arr[min_idx]}`);
                if (arr[j] < arr[min_idx]) {
                    min_idx = j;
                    yield createStep(arr, [j, min_idx], [], sortedIndices, `New minimum found: ${arr[j]}`);
                }
            }
            if (min_idx !== i) {
                [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
                yield createStep(arr, [i, min_idx], [i, min_idx], sortedIndices, `Swapping ${arr[i]} with ${arr[min_idx]}`);
            }
            sortedIndices.push(i);
        }
        yield createStep(arr, [], [], Array.from({ length: n }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.InsertionSort]: {
    name: AlgorithmName.InsertionSort,
    category: AlgoCategory.Sorting,
    description: 'Builds the final sorted array one item at a time by picking and placing.',
    defaultData: [12, 11, 13, 5, 6],
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: `for i from 1 to N:
  key = A[i]
  j = i - 1
  while j >= 0 and A[j] > key:
    A[j + 1] = A[j]
    j = j - 1
  A[j + 1] = key`,
    generator: function* (initialData: number[]) {
        let arr = [...initialData];
        let n = arr.length;
        let sortedIndices: number[] = [0];
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            yield createStep(arr, [i], [], sortedIndices, `Selecting key ${key}`);
            while (j >= 0 && arr[j] > key) {
                yield createStep(arr, [j, j + 1], [], sortedIndices, `Shifting ${arr[j]} right.`);
                arr[j + 1] = arr[j];
                j = j - 1;
                yield createStep(arr, [j + 1, j + 2], [j + 1], sortedIndices, `Moved ${arr[j + 1]}`);
            }
            arr[j + 1] = key;
            sortedIndices.push(i);
            yield createStep(arr, [j + 1], [j + 1], Array.from({ length: i + 1 }, (_, k) => k), `Inserted ${key}`);
        }
        yield createStep(arr, [], [], Array.from({ length: n }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.MergeSort]: {
    name: AlgorithmName.MergeSort,
    category: AlgoCategory.Sorting,
    description: 'A divide and conquer algorithm that divides the input array into halves and merges them.',
    defaultData: [12, 11, 13, 5, 6, 7],
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    pseudoCode: `mergeSort(arr, l, r):
  if l < r:
    m = (l+r)/2
    mergeSort(arr, l, m)
    mergeSort(arr, m+1, r)
    merge(arr, l, m, r)`,
    generator: function* (initialData: number[]) {
        let arr = [...initialData];
        function* merge(l: number, m: number, r: number): Generator<SimulationStep> {
            yield createStep(arr, [], [], [], `Merging [${l}..${m}] and [${m+1}..${r}]`);
            let n1 = m - l + 1, n2 = r - m;
            let L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;
            while (i < n1 && j < n2) {
                yield createStep(arr, [l + i, m + 1 + j], [k], [], `Comparing L: ${L[i]} and R: ${R[j]}`);
                if (L[i] <= R[j]) { arr[k] = L[i]; i++; } 
                else { arr[k] = R[j]; j++; }
                yield createStep(arr, [], [k], [], `Placed ${arr[k]}`);
                k++;
            }
            while (i < n1) { arr[k] = L[i]; yield createStep(arr, [], [k], [], `Placing remaining L: ${L[i]}`); i++; k++; }
            while (j < n2) { arr[k] = R[j]; yield createStep(arr, [], [k], [], `Placing remaining R: ${R[j]}`); j++; k++; }
        }
        function* mergeSortHelper(l: number, r: number): Generator<SimulationStep> {
            if (l >= r) return;
            let m = Math.floor((l + r) / 2);
            yield createStep(arr, [l, r, m], [], [], `Dividing [${l}..${r}]`);
            yield* mergeSortHelper(l, m);
            yield* mergeSortHelper(m + 1, r);
            yield* merge(l, m, r);
        }
        yield* mergeSortHelper(0, arr.length - 1);
        yield createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.QuickSort]: {
    name: AlgorithmName.QuickSort,
    category: AlgoCategory.Sorting,
    description: 'Divides the array into subarrays using a pivot element.',
    defaultData: [40, 10, 80, 30, 90, 50, 70],
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    pseudoCode: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)`,
    generator: function* (initialData: number[]) {
      let arr = [...initialData];
      let stack = [[0, arr.length - 1]];
      while(stack.length > 0) {
        const [low, high] = stack.pop()!;
        if (low < high) {
            let pivot = arr[high], i = low - 1;
            yield createStep(arr, [low, high], [], [], `Pivot: ${pivot}`, high);
            for (let j = low; j < high; j++) {
                 if (arr[j] < pivot) {
                     i++;
                     [arr[i], arr[j]] = [arr[j], arr[i]];
                     yield createStep(arr, [i, j], [i, j], [], `Swapping ${arr[i]} and ${arr[j]}`, high);
                 }
            }
            [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
            const pIndex = i + 1;
            yield createStep(arr, [pIndex, high], [pIndex, high], [], `Placed Pivot at ${pIndex}`, pIndex);
            stack.push([pIndex + 1, high], [low, pIndex - 1]);
        }
      }
      yield createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.LinearSearch]: {
      name: AlgorithmName.LinearSearch,
      category: AlgoCategory.Searching,
      description: 'Iterates through the list sequentially to find the target element.',
      defaultData: [10, 50, 30, 70, 80, 20, 90, 40],
      complexity: { time: 'O(n)', space: 'O(1)' },
      pseudoCode: `for i from 0 to N-1:
  if arr[i] == target:
    return i
return -1`,
      generator: function* (initialData: number[], target: number = 20) {
          let arr = [...initialData];
          for(let i=0; i<arr.length; i++) {
              yield createStep(arr, [i], [], [], `Checking index ${i}: Is ${arr[i]} == ${target}?`);
              if (arr[i] === target) {
                  yield createStep(arr, [], [i], [i], `Found ${target} at index ${i}!`);
                  return;
              }
          }
      }
  },

  [AlgorithmName.BinarySearch]: {
    name: AlgorithmName.BinarySearch,
    category: AlgoCategory.Searching,
    description: 'Search a sorted array by repeatedly dividing the search interval in half.',
    defaultData: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    complexity: { time: 'O(log n)', space: 'O(1)' },
    pseudoCode: `while low <= high:
  mid = low + (high - low) / 2
  if arr[mid] == target: return mid
  if arr[mid] < target: low = mid + 1
  else: high = mid - 1`,
    generator: function* (initialData: number[], target: number = 38) {
      let arr = [...initialData].sort((a, b) => a - b);
      let low = 0, high = arr.length - 1;
      while (low <= high) {
        let mid = Math.floor(low + (high - low) / 2);
        yield createStep(arr, [low, high, mid], [], [], `Range [${low}..${high}], Checking Mid: ${mid}`, mid);
        if (arr[mid] === target) {
          yield createStep(arr, [], [mid], [mid], `Found ${target} at ${mid}!`, mid);
          return;
        }
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
      }
    }
  },

  [AlgorithmName.LeftRotate]: {
    name: AlgorithmName.LeftRotate,
    category: AlgoCategory.Array,
    description: 'Shifts every element in the array to the left. The first element moves to the last position.',
    defaultData: [1, 2, 3, 4, 5, 6],
    complexity: { time: 'O(n * k)', space: 'O(1)' },
    pseudoCode: `for k times:
  temp = arr[0]
  for i from 0 to n-2:
    arr[i] = arr[i+1]
  arr[n-1] = temp`,
    generator: function* (initialData: number[]) {
      let arr = [...initialData];
      let n = arr.length;
      let k = 3; // Number of rotations for demo

      for (let rotation = 1; rotation <= k; rotation++) {
        yield createStep(arr, [], [], [], `Rotation ${rotation}: Storing first element ${arr[0]}`);
        let temp = arr[0];
        yield createStep(arr, [0], [], [], `Stored ${temp} in buffer`, undefined, [temp]);

        for (let i = 0; i < n - 1; i++) {
          yield createStep(arr, [i, i + 1], [i], [], `Shifting ${arr[i+1]} to index ${i}`, undefined, [temp]);
          arr[i] = arr[i + 1];
        }
        
        yield createStep(arr, [n - 1], [n - 1], [], `Placing ${temp} at last position`, undefined, [temp]);
        arr[n - 1] = temp;
        yield createStep(arr, [], Array.from({length: n}, (_, i) => i), [], `Completed rotation ${rotation}`, undefined, []);
      }
      yield createStep(arr, [], [], Array.from({length: n}, (_, i) => i), `Rotated ${k} times left.`);
    }
  },

  [AlgorithmName.RightRotate]: {
    name: AlgorithmName.RightRotate,
    category: AlgoCategory.Array,
    description: 'Shifts every element in the array to the right. The last element moves to the first position.',
    defaultData: [1, 2, 3, 4, 5, 6],
    complexity: { time: 'O(n * k)', space: 'O(1)' },
    pseudoCode: `for k times:
  temp = arr[n-1]
  for i from n-1 down to 1:
    arr[i] = arr[i-1]
  arr[0] = temp`,
    generator: function* (initialData: number[]) {
      let arr = [...initialData];
      let n = arr.length;
      let k = 3;

      for (let rotation = 1; rotation <= k; rotation++) {
        yield createStep(arr, [], [], [], `Rotation ${rotation}: Storing last element ${arr[n-1]}`);
        let temp = arr[n-1];
        yield createStep(arr, [n-1], [], [], `Stored ${temp} in buffer`, undefined, [temp]);

        for (let i = n - 1; i > 0; i--) {
          yield createStep(arr, [i, i - 1], [i], [], `Shifting ${arr[i-1]} to index ${i}`, undefined, [temp]);
          arr[i] = arr[i - 1];
        }
        
        yield createStep(arr, [0], [0], [], `Placing ${temp} at first position`, undefined, [temp]);
        arr[0] = temp;
        yield createStep(arr, [], Array.from({length: n}, (_, i) => i), [], `Completed rotation ${rotation}`, undefined, []);
      }
      yield createStep(arr, [], [], Array.from({length: n}, (_, i) => i), `Rotated ${k} times right.`);
    }
  },

  [AlgorithmName.StackOps]: {
    name: AlgorithmName.StackOps,
    category: AlgoCategory.DataStructure,
    description: 'A linear data structure which follows LIFO.',
    defaultData: [10, 20, 30, 40, 50],
    complexity: { time: 'O(1)', space: 'O(n)' },
    pseudoCode: `push(x): stack.append(x)\npop(): stack.removeLast()`,
    generator: function* (initialData: number[]) {
        let stack: number[] = [];
        for (let val of initialData) {
            stack.push(val);
            yield createStep(initialData, [], [], [], `Push(${val})`, undefined, stack);
        }
        for(let i=0; i<3; i++) {
            let popped = stack.pop();
            yield createStep(initialData, [], [], [], `Pop() -> ${popped}`, undefined, stack);
        }
    }
  },

  [AlgorithmName.QueueOps]: {
      name: AlgorithmName.QueueOps,
      category: AlgoCategory.DataStructure,
      description: 'A linear data structure which follows FIFO.',
      defaultData: [10, 20, 30, 40, 50],
      complexity: { time: 'O(1)', space: 'O(n)' },
      pseudoCode: `enqueue(x): queue.append(x)\ndequeue(): queue.removeFirst()`,
      generator: function* (initialData: number[]) {
          let queue: number[] = [];
          for (let val of initialData) {
              queue.push(val);
              yield createStep(initialData, [], [], [], `Enqueue(${val})`, undefined, queue);
              if (queue.length > 2) {
                  const out = queue.shift();
                  yield createStep(initialData, [], [], [], `Dequeue() -> ${out}`, undefined, queue);
              }
          }
      }
    },

    [AlgorithmName.LinkedList]: {
      name: AlgorithmName.LinkedList,
      category: AlgoCategory.DataStructure,
      description: 'Elements stored in nodes pointing to the next.',
      defaultData: [10, 20, 30, 40],
      complexity: { time: 'O(n)', space: 'O(n)' },
      pseudoCode: `node.next = head; head = node;`,
      generator: function* (initialData: number[]) {
          let list = [...initialData];
          for(let i=0; i<list.length; i++) yield createStep(list, [i], [], [], `Traversing: ${list[i]}`);
          list.unshift(5); yield createStep(list, [0], [0], [], `Inserted 5 at Head`);
      }
    },

    [AlgorithmName.Inorder]: {
      name: AlgorithmName.Inorder,
      category: AlgoCategory.Tree,
      description: 'Left, Root, Right.',
      defaultData: [1, 2, 3, 4, 5, 6, 7],
      complexity: { time: 'O(n)', space: 'O(h)' },
      pseudoCode: `inorder(node.left); visit(node); inorder(node.right);`,
      generator: function* (initialData: number[]) {
        const arr = [...initialData], visited: number[] = [], output: number[] = [];
        function* traverse(idx: number): Generator<SimulationStep> {
            if (idx >= arr.length) return;
            yield createStep(arr, [idx], [], visited, `Checking Node ${arr[idx]}`, undefined, output);
            yield* traverse(2 * idx + 1);
            visited.push(idx); output.push(arr[idx]);
            yield createStep(arr, [idx], [], visited, `Visiting ${arr[idx]}`, undefined, output);
            yield* traverse(2 * idx + 2);
        }
        yield* traverse(0);
      }
    },

    [AlgorithmName.BFS]: {
      name: AlgorithmName.BFS,
      category: AlgoCategory.Graph,
      description: 'Traverses graph level by level.',
      defaultData: [0, 1, 2, 3, 4, 5, 6],
      complexity: { time: 'O(V + E)', space: 'O(V)' },
      pseudoCode: `while queue: node = q.pop(); for n in adj: if !vis: q.push(n)`,
      generator: function* (initialData: number[]) {
        const arr = [...initialData], n = arr.length, adj = generateGraph(n);
        const q = [0], visited = [0];
        while (q.length > 0) {
            const cur = q.shift()!;
            yield createStep(arr, [cur], [], visited, `Visiting Node ${arr[cur]}`, undefined, q, adj);
            for (const neighbor of adj[cur]) {
                if (!visited.includes(neighbor)) {
                    visited.push(neighbor); q.push(neighbor);
                    yield createStep(arr, [cur, neighbor], [], visited, `Added ${arr[neighbor]}`, undefined, q, adj);
                }
            }
        }
      }
    }
};
