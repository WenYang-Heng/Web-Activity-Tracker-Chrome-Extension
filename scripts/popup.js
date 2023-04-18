let keys = [];
let index;
let hours = 0;
let minutes = 0;
let seconds = 0;
let date = [];
let totalTime = [];
const dashboard_1 = document.querySelector('.area-1');
const dashboard_2 = document.querySelector('.area-2');
const ctx = document.getElementById('myChart').getContext('2d');
const ctx2 = document.getElementById('myChart-2').getContext('2d');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const todayBtn = document.getElementById('today');
const weeklyBtn = document.getElementById('weekly');
const datePicker = document.querySelectorAll('input');

const option = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      beginAtZero: false,
      display: false
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'right'
    }
  }
}

const option2 = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      beginAtZero: false,
      grid:{
        display: false
      }
    },
    y:{
      display: false
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

chrome.storage.local.get(null, function(result){
  keys = Object.keys(result);
  index = keys.length - 1;
  dailyChart();
  dashboard_2.style.display = 'none';
});

function dailyChart(){
  let currentDate = keys[index];
  chrome.storage.local.get(currentDate, function(result) {
    // check if data exists for this day
    if (result.hasOwnProperty(currentDate)) {
      let canvas  = Chart.getChart("myChart");

      //Charts have to be destroyed before creating another one
      if(canvas != undefined){
        canvas.destroy();
      }

      let totalTime = 0;
      let stats = result[currentDate];
      const data = [];

      for(let i = 0; i < stats.length; i++){
        // domain.push(stats[i].domain);
        // timeSpent.push(Math.floor(stats[i].totalTime / 1000));
        data.push({domain: stats[i].domain, timeSpent: Math.floor(stats[i].totalTime / 1000)})
        totalTime += stats[i].totalTime;
      }

      data.sort(function(a, b){
        return b.timeSpent - a.timeSpent;
      });

      const domain = data.map(function(item){
        return item.domain;
      });

      const timeSpent = data.map(function(item){
        return item.timeSpent;
      });

      document.getElementById('date').innerText = currentDate;

      convertTime(totalTime);

      document.getElementById('time-spent').innerText = hours + "h " + minutes + "m " + seconds + "s";

      document.getElementById('domain').innerText = domain[0];

      document.getElementById('site-num').innerText = domain.length;

      const colors = generateColors(domain.length);

      const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: domain,
          datasets:[{
            label: currentDate,
            data: timeSpent,
            backgroundColor: colors,
            borderColor: colors,
            barThickness: 30,
            maxBarThickness: 30
          }]
        },
        options: option,
      });
    } else {
      // display a message if no data exists for this day
      console.log("No data available for this day.");
    }
  });  
}

function weeklyChart(){
  if(dashboard_1.style.display === 'block'){
    dashboard_1.style.display == 'none';
    dashboard_2.style.display == 'block';
  }

  chrome.storage.local.get(null, function(result){
    let totalTimeByDomain = {};
    let dateKey = [];
    let totalTimeByDate = [];
    for(let date in result){
      let data = result[date];
      dateKey.push(date);
      let dailySum = 0;
      for(let i = 0; i < data.length; i++){
        const domainByDates = data[i].domain;
        const timeByDomain = data[i].totalTime;
        if(totalTimeByDomain[domainByDates]){
          totalTimeByDomain[domainByDates] += timeByDomain;
        }
        else{
          totalTimeByDomain[domainByDates] = timeByDomain;
        }
        dailySum += data[i].totalTime;
      }
      totalTimeByDate.push(dailySum);
    }

    date = dateKey;
    totalTime = totalTimeByDate;
    
    // create an array of domain names and their total times
    let domainTotals = [];
    for (let domain in totalTimeByDomain) {
      let total = totalTimeByDomain[domain];
      domainTotals.push({ domain: domain, total: total });
    }

    domainTotals.sort(function(a, b){
      return b.total - a.total;
    });
    
    document.getElementsByClassName('top-1')[0].innerText = "1. " + domainTotals[0].domain;
    document.getElementsByClassName('top-2')[0].innerText = "2. " + domainTotals[1].domain;
    document.getElementsByClassName('top-3')[0].innerText = "3. " + domainTotals[2].domain;

    convertTime(domainTotals[0].total);
    document.getElementById('top-site-1').innerText = hours + "h " + minutes + "m " + seconds + "s";

    convertTime(domainTotals[1].total);
    document.getElementById('top-site-2').innerText = hours + "h " + minutes + "m " + seconds + "s";

    convertTime(domainTotals[2].total);
    document.getElementById('top-site-3').innerText = hours + "h " + minutes + "m " + seconds + "s";

    convertTime(avgTime(totalTime));
    document.getElementById('average').innerText = hours + "h " + minutes + "m " + seconds + "s";

    convertTime(sumTime(totalTime));
    document.getElementById('time-spent-dates').innerText = hours + "h " + minutes + "m " + seconds + "s";
    
    let canvas  = Chart.getChart("myChart-2");

    if(canvas != undefined){
      canvas.destroy();
    }

    const myChart = new Chart(ctx2, {
      type: 'bar',
      data:{
        labels: date,
        datasets: [{
          label: 'Total time spent for each day',
          data: totalTime,
          backgroundColor: 'rgba(251, 41, 41, 0.8)',
          borderColor: 'rgba(251, 41, 41, 0.8)',
          borderWidth: 0,
          barThickness: 45
        }],
      },
      options: option2
    });
  });
}

function convertTime(timeInMs){
  seconds = Math.floor((timeInMs / 1000) % 60),
  minutes = Math.floor((timeInMs / (1000 * 60)) % 60),
  hours = Math.floor((timeInMs / (1000 * 60 * 60)) % 24);

  if(hours < 10){
    hours = "0" + hours.toString();
  }
  else{
    hours = hours.toString();
  }

  if(minutes < 10){
    minutes = "0" + minutes.toString();
  }
  else{
    minutes = minutes.toString();
  }

  if(seconds < 10){
    seconds = "0" + seconds.toString();
  }
  else{
    seconds = seconds.toString();
  }

}

function avgTime (time){
  let sum = 0;
  console.log("calc avg time");
  for (let i = 0; i < time.length; i++){
    sum += time[i];
  }

  return (Math.floor(sum / time.length));
}

function sumTime(time){
  let sum = 0;
  for (let i = 0; i < time.length; i++){
    sum += time[i];
  }

  return sum;
}

function generateColors(length) {
  const colors = [];
  const hueStep = 360 / length;
  for (let i = 0; i < length; i++) {
    const hue = i * hueStep;
    const color = `hsl(${hue}, 70%, 50%)`;
    colors.push(color);
  }
  return colors;
}

leftBtn.addEventListener('click', function(){
  index--;
  if(index < 0){
    index = keys.length - 1;
  }
  dailyChart();
});

rightBtn.addEventListener('click', function(){
  index++;
  if(index > keys.length - 1){
    index = 0;
  }
  dailyChart();
});

todayBtn.addEventListener('click', function(){
  if(dashboard_1.style.display === 'none'){
    dashboard_1.style.display = 'grid';
    dashboard_2.style.display = 'none';
  }
  index = keys.length - 1;
  dailyChart();
});

weeklyBtn.addEventListener('click', function(){
  if(dashboard_2.style.display === 'none'){
    dashboard_2.style.display = 'grid';
    dashboard_1.style.display = 'none';
  }

  weeklyChart();
});

// datePicker.forEach(function(dateSelect){
//   dateSelect.addEventListener('change', function(){
//     console.log("start date: " + startDate.value);
//     console.log("end date: " + endDate.value);
//     let myChart = Chart.getChart("myChart-2");
//     if(myChart != undefined){
//       let dateCopy = [...date];
//       let totalTimeCopy = [...totalTime];

//       for(let i = 0; i < dateCopy.length; i++){
//         dateCopy[i] = dateCopy[i].split("-").reverse().join("-");
//       }

//       console.log(totalTimeCopy);
//       //get dates by index
//       const startDateIndex = dateCopy.indexOf(startDate.value);
//       const endDateIndex = dateCopy.indexOf(endDate.value);
//       console.log("start index" + startDateIndex);
//       console.log("end index: " + endDateIndex);

//       //slice array between 2 dates
//       const filterDate = dateCopy.slice(startDateIndex, endDateIndex + 1);
//       console.log(filterDate);
//       //replace labels
//       myChart.data.labels = filterDate;

//       //replace data
//       const filterTotalTime = totalTimeCopy.slice(startDateIndex, endDateIndex + 1);
//       console.log(filterTotalTime);
//       myChart.data.datasets[0].data = filterTotalTime;
//       myChart.update();    
//     }
//     else{
//       console.log("empty chart");
//     }
//   });  
// });

