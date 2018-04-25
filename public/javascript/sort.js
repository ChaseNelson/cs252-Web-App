function quickSort(arr) {
  return qSort(arr, 0, arr.length - 1);
}

function qSort(arr, left, right) {
  if (left < right) {
    let pivot     = right;
    let partIndex = partition(arr, pivot, left, right)

    qSort(arr, left, partIndex - 1);
    qSort(arr, partIndex + 1, right);
  }
  return arr;
}

function partition(arr, pivot, left, right) {
  let pivVal    = arr[pivot].timestamp;
  let partIndex = left;

  for (let i = left; i < right; i++) {
    if (arr[i].timestamp > pivVal) {
      swap(arr, i, partIndex);
      partIndex++;
    }
  }
  swap(arr, right, partIndex)
  return partIndex;
}

function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}
