import { AlgorithmName, SimulationStep } from '../types';

// Helper to create a step object
const createStep = (
  data: number[],
  comparedIndices: number[] = [],
  swappedIndices: number[] = [],
  sortedIndices: number[] = [],
  description: string = '',
  pivotIndex?: number,
  auxiliaryData?: number[]
): SimulationStep => ({
  data: [...data],
  comparedIndices,
  swappedIndices,
  sortedIndices,
  description,
  pivotIndex,
  auxiliaryData: auxiliaryData ? [...auxiliaryData] : undefined,
});

export const ALGORITHMS: Record<string, any> = {
  [AlgorithmName.BubbleSort]: {
    name: AlgorithmName.BubbleSort,
    category: 'Sorting',
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
    category: 'Sorting',
    description: 'Divides the input list into two parts: a sorted sublist of items which is built up from left to right at the front (left) of the list and a sublist of the remaining unsorted items.',
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
            yield createStep(arr, [i, min_idx], [], sortedIndices, `Current minimum starts at index ${i} (${arr[i]})`);

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
            yield createStep(arr, [], [], sortedIndices, `Index ${i} is sorted`);
        }
        yield createStep(arr, [], [], Array.from({ length: n }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.InsertionSort]: {
    name: AlgorithmName.InsertionSort,
    category: 'Sorting',
    description: 'Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.',
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
        // Index 0 is trivially sorted
        let sortedIndices: number[] = [0];

        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            yield createStep(arr, [i], [], sortedIndices, `Selecting key ${key} to insert into sorted portion`);

            while (j >= 0 && arr[j] > key) {
                yield createStep(arr, [j, j + 1], [], sortedIndices, `Comparing ${arr[j]} > ${key}. Shifting ${arr[j]} right.`);
                arr[j + 1] = arr[j];
                j = j - 1;
                // Yield step showing shift (duplicate value momentarily)
                yield createStep(arr, [j + 1, j + 2], [j + 1], sortedIndices, `Shifted ${arr[j + 1]} to index ${j + 1}`);
            }
            arr[j + 1] = key;
            sortedIndices.push(i); // Technically 0..i are sorted now
            yield createStep(arr, [j + 1], [j + 1], Array.from({ length: i + 1 }, (_, k) => k), `Inserted ${key} at index ${j + 1}`);
        }
        yield createStep(arr, [], [], Array.from({ length: n }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.MergeSort]: {
    name: AlgorithmName.MergeSort,
    category: 'Sorting',
    description: 'A divide and conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
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
            yield createStep(arr, [], [], [], `Merging subarrays [${l}..${m}] and [${m+1}..${r}]`);
            
            let n1 = m - l + 1;
            let n2 = r - m;
            let L = new Array(n1);
            let R = new Array(n2);
            
            for (let i = 0; i < n1; i++) L[i] = arr[l + i];
            for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
            
            let i = 0, j = 0;
            let k = l;
            
            while (i < n1 && j < n2) {
                yield createStep(arr, [l + i, m + 1 + j], [k], [], `Comparing L: ${L[i]} and R: ${R[j]}`);
                if (L[i] <= R[j]) {
                    arr[k] = L[i];
                    i++;
                } else {
                    arr[k] = R[j];
                    j++;
                }
                yield createStep(arr, [], [k], [], `Placed ${arr[k]} at index ${k}`);
                k++;
            }
            
            while (i < n1) {
                arr[k] = L[i];
                yield createStep(arr, [], [k], [], `Placing remaining L: ${L[i]} at index ${k}`);
                i++;
                k++;
            }
            while (j < n2) {
                arr[k] = R[j];
                yield createStep(arr, [], [k], [], `Placing remaining R: ${R[j]} at index ${k}`);
                j++;
                k++;
            }
        }

        function* mergeSortHelper(l: number, r: number): Generator<SimulationStep> {
            if (l >= r) return;
            let m = l + Math.floor((r - l) / 2);
            yield createStep(arr, [l, r, m], [], [], `Dividing [${l}..${r}] at ${m}`);
            
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
    category: 'Sorting',
    description: 'Divides the array into subarrays by selecting a pivot element and positioning it so that all smaller elements are to the left and larger elements to the right.',
    defaultData: [40, 10, 80, 30, 90, 50, 70],
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    pseudoCode: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)`,
    generator: function* (initialData: number[]) {
      let arr = [...initialData];
      let stack = [0, arr.length - 1];
      
      while(stack.length > 0) {
        const high = stack.pop()!;
        const low = stack.pop()!;
        
        if (low < high) {
            let pivot = arr[high];
            let i = low - 1;
            yield createStep(arr, [low, high], [], [], `Partitioning [${low}..${high}], Pivot: ${pivot}`, high);
            
            for (let j = low; j < high; j++) {
                 yield createStep(arr, [j, high], [], [], `Comparing ${arr[j]} < Pivot(${pivot})?`, high);
                 if (arr[j] < pivot) {
                     i++;
                     [arr[i], arr[j]] = [arr[j], arr[i]];
                     yield createStep(arr, [i, j], [i, j], [], `Swapping ${arr[i]} and ${arr[j]}`, high);
                 }
            }
            [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
            yield createStep(arr, [i+1, high], [i+1, high], [], `Placed Pivot ${pivot} at correct position ${i+1}`, i+1);
            
            const pIndex = i + 1;
            // Push right side first
            stack.push(pIndex + 1, high);
            // Push left side
            stack.push(low, pIndex - 1);
        }
      }
      yield createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k), 'Sorting Complete');
    }
  },

  [AlgorithmName.LinearSearch]: {
      name: AlgorithmName.LinearSearch,
      category: 'Searching',
      description: 'Iterates through the list sequentially to find the target element.',
      defaultData: [10, 50, 30, 70, 80, 20, 90, 40],
      complexity: { time: 'O(n)', space: 'O(1)' },
      pseudoCode: `for i from 0 to N-1:
  if arr[i] == target:
    return i
return -1`,
      generator: function* (initialData: number[], target: number = 20) {
          // If the target is not in the list, default to something that is, or last element
          if (!initialData.includes(target)) target = initialData[initialData.length-1];
          
          let arr = [...initialData];
          yield createStep(arr, [], [], [], `Starting Linear Search for ${target}`);
          
          for(let i=0; i<arr.length; i++) {
              yield createStep(arr, [i], [], [], `Checking index ${i}: Is ${arr[i]} == ${target}?`);
              if (arr[i] === target) {
                  yield createStep(arr, [], [i], [i], `Found ${target} at index ${i}!`);
                  return;
              }
          }
          yield createStep(arr, [], [], [], `Target ${target} not found.`);
      }
  },

  [AlgorithmName.BinarySearch]: {
    name: AlgorithmName.BinarySearch,
    category: 'Searching',
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
      // Ensure target exists for demo if not provided nicely
      if (!arr.includes(target)) target = arr[Math.floor(arr.length/2)];

      yield createStep(arr, [], [], [], `Initial Sorted Array. Searching for ${target}`);

      let low = 0;
      let high = arr.length - 1;

      while (low <= high) {
        let mid = Math.floor(low + (high - low) / 2);
        yield createStep(arr, [low, high, mid], [], [], `Range [${low}..${high}], Checking Mid: ${mid} (${arr[mid]})`, mid);

        if (arr[mid] === target) {
          yield createStep(arr, [], [mid], [mid], `Found ${target} at index ${mid}!`, mid);
          return;
        }

        if (arr[mid] < target) {
          yield createStep(arr, [low, high, mid], [], [], `${arr[mid]} < ${target}, checking right half.`);
          low = mid + 1;
        } else {
          yield createStep(arr, [low, high, mid], [], [], `${arr[mid]} > ${target}, checking left half.`);
          high = mid - 1;
        }
      }
      yield createStep(arr, [], [], [], `${target} not found in array.`);
    }
  },

  [AlgorithmName.StackOps]: {
    name: AlgorithmName.StackOps,
    category: 'Data Structure',
    description: 'A Stack is a linear data structure which follows the LIFO (Last In First Out) order.',
    defaultData: [10, 20, 30, 40, 50],
    complexity: { time: 'O(1) (Push/Pop)', space: 'O(n)' },
    pseudoCode: `push(x): stack.append(x)
pop(): return stack.removeLast()
peek(): return stack.last()`,
    generator: function* (initialData: number[]) {
        let inputSequence = [...initialData];
        let stack: number[] = [];
        
        yield createStep([], [], [], [], `Starting with empty Stack. Input sequence: ${inputSequence.join(', ')}`, undefined, stack);

        // Simulate pushing all
        for (let val of inputSequence) {
            stack.push(val);
            yield createStep(inputSequence, [], [], [], `Push(${val})`, undefined, stack);
        }

        yield createStep(inputSequence, [], [], [], `Stack full. Now Popping...`, undefined, stack);

        // Simulate popping half
        const pops = Math.ceil(initialData.length / 2);
        for(let i=0; i<pops; i++) {
            let popped = stack.pop();
            yield createStep(inputSequence, [], [], [], `Pop() -> ${popped}`, undefined, stack);
        }
        
        yield createStep(inputSequence, [], [], [], `Operation Sequence Complete`, undefined, stack);
    }
  },

  [AlgorithmName.QueueOps]: {
      name: AlgorithmName.QueueOps,
      category: 'Data Structure',
      description: 'A Queue is a linear data structure which follows the FIFO (First In First Out) order.',
      defaultData: [10, 20, 30, 40, 50],
      complexity: { time: 'O(1) (Enqueue/Dequeue)', space: 'O(n)' },
      pseudoCode: `enqueue(x): queue.append(x)
dequeue(): return queue.removeFirst()
front(): return queue.first()`,
      generator: function* (initialData: number[]) {
          let inputSequence = [...initialData];
          let queue: number[] = [];
          
          yield createStep([], [], [], [], `Starting with empty Queue. Input: ${inputSequence.join(', ')}`, undefined, queue);
  
          // Simulate mixed ops: Enqueue 2, Dequeue 1
          for (let i = 0; i < inputSequence.length; i++) {
              queue.push(inputSequence[i]);
              yield createStep(inputSequence, [], [], [], `Enqueue(${inputSequence[i]})`, undefined, queue);
              
              // Occasionally dequeue to show movement
              if (i > 0 && i % 2 !== 0) {
                  const val = queue.shift();
                  yield createStep(inputSequence, [], [], [], `Dequeue() -> ${val}`, undefined, queue);
              }
          }
          
          // Clear rest
          while(queue.length > 0) {
              const val = queue.shift();
              yield createStep(inputSequence, [], [], [], `Dequeue() -> ${val}`, undefined, queue);
          }
          
          yield createStep(inputSequence, [], [], [], `Queue Empty`, undefined, queue);
      }
    }
};