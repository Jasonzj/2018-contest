//跨浏览器事件绑定
export let addEvent = (element, event, hanlder) => {
  if (element.addEventListener) {
    addEvent = (element, event, hanlder) => {
      element.addEventListener(event, hanlder, false)
    }
  } else if (element.attachEvent) {
    addEvent = (element, event, hanlder) => {
      element.attachEvent('on' + event, hanlder)
    }
  } else {
    addEvent = (element, event, hanlder) => {
      element['on' + event] = hanlder
    }
  }

  addEvent(element, event, hanlder)
}

// 根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动  
export const getDirection = (startx, starty, endx, endy) => {
  const angx = endx - startx;
  const angy = endy - starty;
  let result = 0;
  
  if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
    return result
  }

  let angle = Math.atan2(angy, angx) * 180 / Math.PI
  if (angle >= -135 && angle <= -45) {
    result = 1
  } else if (angle > 45 && angle < 135) {
    result = 2
  } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
    result = 3
  } else if (angle >= -45 && angle <= 45) {
    result = 4
  }

  return result
}

export const store = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  fetch(key) {
    return JSON.parse(localStorage.getItem(key)) || []
  }
}