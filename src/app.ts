import Control from "./js/control"

window.control = new Control(
  document.querySelector('.board'),
  document.querySelector('.btns'),
  document.querySelector('.scores__score span'),
  document.querySelector('.scores__score--best span'),
  document.querySelector('.mask')
)