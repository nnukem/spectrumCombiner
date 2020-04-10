import Chart from 'chart.js'
import SpectrumData from './SpectrumData'
import EventDispatcher from './nuke/utils/EventDispatcher';

export default class LedBox extends EventDispatcher{
  constructor (element) {
    super(['change','ready'])
    this.element = typeof element === 'string' ? document.querySelector(element) : element
    this.form = this.element.querySelector('form')
    this.spdFileUrl = this.element.dataset.spd
    this.name = this.element.dataset.name
    this.spd = new SpectrumData()
    
    this.data = {
      ratio: parseFloat(this.element.querySelector('.js-spectrum-item-ratio').value),
      flux: parseFloat(this.element.querySelector('.js-spectrum-item-flux').value),
      count: parseInt(this.element.querySelector('.js-spectrum-item-count').value)
    }
    if (this.spdFileUrl) {
      this.loadSpd()
      this.initForm()
      this.initEvents()
    }
  }
  initEvents(){
    this.form.addEventListener('change',this.formChangeHandler.bind(this))
  }

  initForm(){
    for(let el of this.form.elements){
      this.data[el.name] = parseFloat(el.value)
    }
  }

  formChangeHandler(e){
    this.data[e.target.name] = parseFloat(e.target.value)
    this.emit('change', this.data)
  }

  loadSpd () {
    var xhrobj = new XMLHttpRequest()
    xhrobj.open('GET', this.spdFileUrl)
    xhrobj.addEventListener('readystatechange', (e) => {
      if (xhrobj.readyState == 4 && xhrobj.status == 200 && xhrobj.responseText) {
        this.spd = new SpectrumData(JSON.parse(xhrobj.responseText).reference)
        // this.spd = new SpectrumData(JSON.parse(xhrobj.responseText).measured)
        this.initChart()
        // console.log(this.name,JSON.stringify(this.spd.data))
      }
    })
    xhrobj.send()
  }

  initChart(){
    var SPDchartData = {
      datasets: [
        {
          label: this.name,
          pointColor: '#da3e2f',
          strokeColor: '#da3e2f',
          borderWidth: 0.1,
          radius: 0,
          tension: 0.1,
          fill: false,
          pointHitDetectionRadius: 10,
          tooltipTemplate: "<%= value + ' %' %>",
          data: this.spd.array
        }
      ]
    }
    var ctx = this.element.querySelector('canvas').getContext('2d')
    var config = {
      type: 'line',
      data: SPDchartData,
      options: {
        responsive:true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              max: 1.0,
              min: 0,
              stepSize: 0.1
            }
          }],
          xAxes: [{
            type: 'linear',
            position: 'bottom',
            ticks: {
              max: 780,
              min: 380,
              stepSize: 20
            }
          }]

        }
      }
    }

    this.spdChart = new Chart(ctx, config)
    this.emit('ready')
  }
}
