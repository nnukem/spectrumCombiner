import LedBox from './LedBox'
import Chart from 'chart.js'
import LightCalc from './LightCalc';
import SpectrumData from './SpectrumData';
import Sticky from 'sticky-js';


export default class Main {
  constructor () {
    this.screen = document.querySelector('.js-spectrum')
    this.cieScreen = document.querySelector('.js-cie')
    this.ctx = this.screen.getContext('2d')
    this.ctx2 = this.cieScreen.getContext('2d')
    this.infos = document.querySelectorAll('.js-info') 
    this.leds = []
    this.outputSpectrum = new SpectrumData()
    this.outputChart;
    this.readyCount = 0
    this.sticky = new Sticky('.js-sticky')

    this.loadCiebg()
    this.initChartType()
    this.initOutputChart()
    this.initCieChart()
    this.initSpectrumData()
    this.createOutputSpectrum()
    this.updateChart()
  }

  loadCiebg(){
    this.cieBg = new Image()
    this.cieBg.addEventListener('load',(e) =>{
        this.readyHandler()
    })
    this.cieBg.src = '/files/cie.jpg'
  }
  initSpectrumData () {
    let initialized = 0
    let boxes = Array.from(document.querySelectorAll('.js-spectrum-item'))
    for (let box of boxes) {
      let ledBox = new LedBox(box)
      ledBox.i = initialized
      ledBox.on('change', this.changeHandler.bind(this))
      ledBox.on('ready', this.readyHandler.bind(this))
      
      this.leds.push(ledBox)
      initialized++
    }
  }

  initOutputChart(){
    var SPDchartData = {
      datasets: [
        {
          label: 'Output spectrum',
          pointColor: '#da3e2f',
          strokeColor: '#da3e2f',
          borderWidth: 0.1,
          radius: 0,
          tension: 0.1,
          fill: false,
          pointHitDetectionRadius: 10,
          tooltipTemplate: "<%= value + ' %' %>",
          data: this.outputSpectrum.array
        }
      ]
    }
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

    this.outputChart = new Chart(this.ctx, config)
  }

  initCieChart(){
    this.cieChart = new Chart(this.ctx2, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Scatter Dataset',
            borderColor:'#5b5b5b',
            borderWidth: 0.00001,
            radius : 3,
            tension: 0.00001,
            fill:false,
            backgroundColor:'#5b5b5b',
            data: [
              {x: 0.5, y: 0.5}
            ]
          }
        ]
      },
      options: {
        backgroundColor:'#ffffff',
        maintainAspectRatio: false,
        responsive:true,
        bezierCurve:false,
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
                        max: 1.0,
                        min: 0,
                        stepSize: 0.1
                    }
            }]
            
        },
        tooltips: {
          enabled: true,
          mode: 'single',
          callbacks: {
            label: function(tooltipItems, data) {              
              return 'x: '+ tooltipItems.xLabel.toPrecision(3)+', y: '+tooltipItems.yLabel.toPrecision(3);
            }
          }
        },
        animation: {
          duration: 0
        }
      }
    });
  }

  initChartType () {
    var originalLineDraw = Chart.controllers.line.prototype.draw
    Chart.helpers.extend(Chart.controllers.line.prototype, {
      draw: function () {
        originalLineDraw.apply(this, arguments)
        var chart = this.chart
        var ctx = chart.chart.ctx

        for (let c = 0; c < chart.data.datasets[0].data.length - 1; c++) {
          var xaxis = chart.scales['x-axis-0']
          var yaxis = chart.scales['y-axis-0']

          ctx.save()
          ctx.beginPath()
          var start = [xaxis.getPixelForValue(c + 380), yaxis.getPixelForValue(chart.data.datasets[0].data[c].y, 500)]
          var end = [start[0], yaxis.bottom]
          var next = [xaxis.getPixelForValue(c + 380 + 1), yaxis.getPixelForValue(chart.data.datasets[0].data[c + 1], c + 1)]
          ctx.moveTo(start[0], start[1])
          ctx.strokeStyle = LightCalc.wltohex(c + 380)
          ctx.lineTo(next[0] + 1, next[1])
          ctx.lineTo(next[0] + 1, end[1])
          ctx.lineTo(end[0], end[1])
          ctx.lineTo(start[0], start[1])
          ctx.stroke()
          ctx.fillStyle = LightCalc.wltohex((c * 1) + 380)
          ctx.fill()

          ctx.restore()
        }
      }
    })
  }

  resizeCIE(zoom) {
    zoom = zoom || 0
    let zoomFactor = 1 - (zoom*.99) / 100;
    
    let x = this.cieChart.data.datasets[0].data[0].x;
    let y = this.cieChart.data.datasets[0].data[0].y;

    let x0 = 0;
    let x1 = 1;
    let y0 = 0;
    let y1 = 1;

    this.cieChart.options.scales.yAxes[0].ticks.max = y1;
    this.cieChart.options.scales.xAxes[0].ticks.max = x1;
    this.cieChart.options.scales.yAxes[0].ticks.min = y0;
    this.cieChart.options.scales.xAxes[0].ticks.min = x0;

    if(x1-x0 >0.5) {
      this.cieChart.options.scales.xAxes[0].ticks.stepSize = 0.1;
    }
    else if(x1-x0 >0.1) {
      this.cieChart.options.scales.xAxes[0].ticks.stepSize = 0.05;
    }
    else if(x1-x0 >0.05) {
      this.cieChart.options.scales.xAxes[0].ticks.stepSize = 0.01;
    }
    else {
      this.cieChart.options.scales.xAxes[0].ticks.stepSize = 0.005;
    }
    
    if(y1-y0 >0.5) {
      this.cieChart.options.scales.yAxes[0].ticks.stepSize = 0.1;
    }
    else if(y1-y0 >0.1) {
      this.cieChart.options.scales.yAxes[0].ticks.stepSize = 0.05;
    }
    else if(y1-y0 >0.05) {
      this.cieChart.options.scales.yAxes[0].ticks.stepSize = 0.01;
        }
    else {
        this.cieChart.options.scales.yAxes[0].ticks.stepSize = 0.005;
    }  
    
    this.cieChart.update();

    var xaxis = this.cieChart.scales['x-axis-0'];
    var yaxis = this.cieChart.scales['y-axis-0'];

    var hFactor = x1-x0;
    var wFactor = y1-y0;

    var h = yaxis.getPixelForTick(0);
    var w = xaxis.getPixelForTick(xaxis.ticks.length-1);

    let bottomPadding = this.cieChart.chart.ctx.canvas.offsetHeight - yaxis.bottom;
    let topPadding = h;
    let leftPadding = xaxis.left+1;
    let rightPadding = this.cieChart.chart.ctx.canvas.offsetWidth - xaxis.right;

    document.getElementById('backgroundcie').height = (yaxis.bottom - h);
    document.getElementById('backgroundcie').width = (w - xaxis.left);    

    //var image = new Image();
    var canvas = document.getElementById('backgroundcie');
    var ctx3 = canvas.getContext('2d');
    ctx3.drawImage(this.cieBg,Math.round(x0*this.cieBg.width),Math.round(( 1-y1)*this.cieBg.height), Math.floor(this.cieBg.width * wFactor), Math.floor(this.cieBg.height * hFactor),0,0,(w - xaxis.left),(yaxis.bottom - h));

    document.getElementById("bgcie").style.marginLeft = leftPadding+"px";
    document.getElementById("bgcie").style.marginTop = topPadding+"px";
  }

  readyHandler(e){
    this.readyCount++
    if(this.readyCount == this.leds.length+1) {
      this.changeHandler()
      this.initEvents()
    }
  }

  initEvents(){

    window.addEventListener('resize',e=>{
      this.outputChart.resize()
      this.cieChart.resize()
      this.resizeCIE()
      this.sticky.update();
    })

    // this.calcDVectors()
  }
  changeHandler (e) {
    this.createOutputSpectrum()
    this.updateChart()
    this.updateInfo()
    this.resizeCIE()
  }

  getDigitalData (item) {
    let data = []
    let ctx = item.ctx
    let cols = item.width
    let rows = item.height
    let pixeldata, acc
    for (let i = 0; i < cols; i++) {
      pixeldata = ctx.getImageData(i, 0, 1, rows).data.reverse()
      acc = 0
      for (let p = 0; p < pixeldata.length; p += 4) {
        if (pixeldata[p] == 0 || p == pixeldata.length - 4) {
          data[i] = acc
          break
        }
        acc++
      }
    }
    return data
  }

  updateInfo(){
    let params = this.outputSpectrum.getParameters()
    let total = 0
    let flux = 0

    for(let led of this.leds) {
      total += led.data.count
      flux += led.data.count*led.data.flux
    }
    
    document.querySelector('[name="total"] .js-value').innerHTML = total || "--"
    document.querySelector('[name="flux"] .js-value').innerHTML = flux || "--"
    document.querySelector('[name="cct"] .js-value').innerHTML = Math.round(params.cct)? Math.round(params.cct) + "K":"--"
    document.querySelector('[name="duv"] .js-value').innerHTML = params.duv?params.duv.toPrecision(4) : "--" 
    document.querySelector('[name="cri"] .js-value').innerHTML = params.ra?params.ra.toPrecision(3) : "--" 

    var criSamples = document.querySelectorAll('[name="cri-samples"]')

    for(let i=0; i< params.cri.length; i++){
      let cri = criSamples[i].querySelector('.js-value')
      let bar = criSamples[i].querySelector('.js-bar')
      cri.innerHTML = params.cri[i].toPrecision(3)
      bar.style.height = (params.cri[i]*0.8)+'%'
    }
  }

  updateChart(){
    this.outputChart.data.datasets[0].data = this.outputSpectrum.data
    this.cieChart.data.datasets[0].data[0].x = this.outputSpectrum.getParameters().xy[0]
    this.cieChart.data.datasets[0].data[0].y = this.outputSpectrum.getParameters().xy[1]
    this.outputChart.update()
    this.cieChart.update()
  }

  createOutputSpectrum () {
    let output = []
    let acc; 
    
    if(this.leds.length && this.leds[0].spd.array.length){
      for (let i = 0; i <= 400; i++) {
        acc = 0
        for (let s of this.leds) {
          acc += s.data.count * s.spd.array[i] * s.data.ratio
        }
        output[i] = acc
      }
      this.outputSpectrum.array = output  
    }
  }

  /*calcDVectors(){
    //380.. 5nm interval .. 780

    let s0 = [63.4,64.6,65.8,80.3,94.8,99.8,104.8,105.3,105.9,101.35,96.8,105.35,113.9,119.75,125.6,125.5,125.5,123.4,121.3,121.3,121.3,117.4,113.5,113.3,113.1,111.95,110.8,108.65,106.5,107.65,108.8,107.5,105.3,104.85,104.4,102.4,100.0,98.0,96.0,95.55,95.1,92.1,89.1,89.8,90.5,90.4,90.3,89.35,88.4,86.2,84.0,84.55,85.1,83.5,81.9,82.25,82.6,83.75,84.9,83.1,81.3,79.6,71.9,73.1,74.3,75.35,76.4,69.85,63.3,67.5,71.7,74.35,77.0,71.1,65.2,56.45,47.7,58.15,68.6,66.8,65.0]
    let s1 = [38.5,36.75,35.0,39.2,43.4,44.85,46.3,45.1,43.9,40.5,37.1,36.9,36.7,36.3,35.9,34.25,32.6,30.25,27.9,26.1,24.3,22.2,20.1,18.15,16.2,14.7,13.2,10.9,8.6,7.35,6.1,5.15,4.2,3.05,1.9,0.95,0.0,-0.8,-1.6,-2.55,-3.5,-3.5,-3.5,-4.65,-5.8,-6.05,-7.2,-7.9,-8.6,-9.05,-9.5,-10.2,-10.9,-10.8,-10.7,-11.35,-12.0,-13.0,-14.0,-13.8,-13.6,-12.8,-12.0,-12.65,-13.3,-13.1,-12.9,-11.75,-10.6,-11.1,-11.6,-11.9,-12.2,-11.2,-10.2,-9.0,-7.8,-9.5,-11.2,-10.8,-10.4]
    let s2 = [3.0,2.1,1.2,0.05,-1.1,-0.5,-0.5,-0.6,-0.7,-0.95,-1.2,-1.95,-2.6,-2.75,-2.9,-2.85,-2.8,-2.7,-2.6,-2.6,-2.6,-2.2,-1.8,-1.66,-1.5,-1.4,-1.3,-1.25,-1.2,-1.1,-1,-0.75,-0.5,-0.3,-0.3,-0.15,0.0,0.1,0.2,0.3,0.5,1.3,2.1,2.65,3.2,3.65,4.1,4.4,4.7,4.9,5.1,5.9,6.7,7.0,7.3,8.0,8.6,9.2,9.8,10.0,10.2,9.25,8.3,8.95,9.6,9.08,8.5,7.75,7.0,7.3,7.6,7.8,8.0,7.35,6.7,5.95,5.2,6.3,7.4,7.1,6.8]

    let s0p=[],s1p=[],s2p=[],x0,x1,y0,y1,y,x;

    
    for(let i=0;i<s0.length-1;i++){
       x0 = 380+i*5 
       x1 = x0+5
       s0p.push(s0[i])
       s1p.push(s1[i])
       s2p.push(s2[i])
       for(let j=1;j<5;j++){
        x = x0+j 
        s0p.push(this.interpolate(x0,x1,s0[i],s0[i+1],x))
        s1p.push(this.interpolate(x0,x1,s1[i],s1[i+1],x))
        s2p.push(this.interpolate(x0,x1,s2[i],s2[i+1],x))
       }
    }
    s0p.push(s0.pop())
    s1p.push(s1.pop())
    s2p.push(s2.pop())
  }

  interpolate(x0,x1,y0,y1,x){
    return (y0*(x1-x)+y1*(x-x0))/(x1-x0)
  }*/
}
