/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  let conundrum = new Map();
  let sumPair = [];
  for (let i = 0; i < nums.length; i++) {
    const element = nums[i];
    let complement = target - element;
    if (conundrum.has(complement)) {
    }
  }

  return sumPair;
};
