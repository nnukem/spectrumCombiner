const HEADER = document.querySelector('.js-header')
const MENU_TRIGGER = document.querySelector('.js-trigger-nav-main')

const BREAKPOINTS = {
  tablet: 1200,
  mobile: 670
}

const MATCHES = {
  tablet: window.matchMedia('screen and (max-width: ' + BREAKPOINTS.tablet + 'px)')
}

module.exports = {
  BREAKPOINTS,
  MATCHES,
  HEADER,
  MENU_TRIGGER
}
