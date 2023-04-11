let keys = [];
let index;
let hours = 0;
let minutes = 0;
let seconds = 0;
const date = [];
const totalTime = [];
const ctx = document.getElementById('myChart').getContext('2d');
const ctx2 = document.getElementById('myChart-2').getContext('2d');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const todayBtn = document.getElementById('today');
const weeklyBtn = document.getElementById('weekly');
const datePicker = document.querySelectorAll('input');
let startDate = document.getElementById('startDate');
let endDate = document.getElementById('endDate');

const option = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: false
    },
  },
}

chrome.storage.local.get(null, function(result){
  keys = Object.keys(result);
  index = keys.length - 1;
  dailyChart();
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

      console.log(domain);

      convertTime(totalTime);

      document.getElementById('time-spent').innerText = hours + "h " + minutes + "m " + seconds + "s";

      document.getElementById('domain').innerText = domain[0];

      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: domain,
          datasets:[{
            label: currentDate,
            data: timeSpent,
            backgroundColor: 'rgba(251, 41, 41, 0.8)',
            borderColor: 'rgba(251, 41, 41, 0.8)',
            borderWidth: 0,
            barThickness: 45
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
  chrome.storage.local.get(null, function(result){
    for(let dateKey in result){
      let data = result[dateKey];
      date.push(dateKey);
      let dailySum = 0;
      for(let i = 0; i < data.length; i++){
        dailySum += data[i].totalTime;
      }
      totalTime.push(dailySum);
    }

    console.log(totalTime);

    convertTime(avgTime(totalTime));
    document.getElementById('average').innerText = hours + "h " + minutes + "m " + seconds + "s";

    convertTime(sumTime(totalTime));
    document.getElementById('time-spent-dates').innerText = hours + "h " + minutes + "m " + seconds + "s";


    let minDate = date[0].split("-").reverse().join("-");
    let maxDate = date[date.length - 1].split("-").reverse().join("-");

    startDate.setAttribute('value', minDate);
    endDate.setAttribute('value', maxDate);
    startDate.setAttribute('min', minDate);
    startDate.setAttribute('max', maxDate);
    endDate.setAttribute('min', minDate);
    endDate.setAttribute('max', maxDate);

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
      options: option
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
  index = keys.length - 1;
  dailyChart();
});

weeklyBtn.addEventListener('click', function(){
  weeklyChart();
});

datePicker.forEach(function(dateSelect){
  dateSelect.addEventListener('change', function(){
    console.log("start date: " + startDate.value);
    console.log("end date: " + endDate.value);
    let myChart = Chart.getChart("myChart-2");
    if(myChart != undefined){
      let dateCopy = [...date];
      let totalTimeCopy = [...totalTime];

      for(let i = 0; i < dateCopy.length; i++){
        dateCopy[i] = dateCopy[i].split("-").reverse().join("-");
      }

      console.log(totalTimeCopy);
      //get dates by index
      const startDateIndex = dateCopy.indexOf(startDate.value);
      const endDateIndex = dateCopy.indexOf(endDate.value);
      console.log("start index" + startDateIndex);
      console.log("end index: " + endDateIndex);

      //slice array between 2 dates
      const filterDate = dateCopy.slice(startDateIndex, endDateIndex + 1);
      console.log(filterDate);
      //replace labels
      myChart.data.labels = filterDate;

      //replace data
      const filterTotalTime = totalTimeCopy.slice(startDateIndex, endDateIndex + 1);
      console.log(filterTotalTime);
      myChart.data.datasets[0].data = filterTotalTime;
      myChart.update();    
    }
    else{
      console.log("empty chart");
    }
  });  
});

