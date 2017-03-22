module.exports = function(obj) {
  // Check if an object is empty
  if(typeof obj !== 'object') {
    return true;
  } else {
    let size = 0;
    for(let key in obj) {
      if(obj.hasOwnProperty(key)) {
        size++;
      }
    }
    if(size > 0) {
      return false;
    }
    return true;
  }
}