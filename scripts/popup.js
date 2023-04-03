currentDate = getDate();

// get the data for a specific day
chrome.storage.local.get(currentDate, function(result) {
  // check if data exists for this day
  if (result.hasOwnProperty(currentDate)) {
    const ctx = document.getElementById('myChart').getContext('2d');

    let stats = result[currentDate];
    const domain = [];
    const timeSpent = [];

    for(let i = 0; i < stats.length; i++){
      domain.push(stats[i].domain);
      timeSpent.push(stats[i].totalTime);
    }

    console.log(domain);
    console.log(timeSpent);

    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: domain,
        datasets:[{
          label: 'Time spent in milliseconds',
          data: timeSpent,
          backgroundColor: 'rgba(251, 41, 41, 0.8)',
          borderColor: 'rgba(251, 41, 41, 0.8)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: false
          },
        }
      }
    });
  } else {
    // display a message if no data exists for this day
    console.log("No data available for this day.");
  }
});


function getDate() {
  let now = new Date();
  now.setDate(now.getDate());
  let date = now.toLocaleDateString('en-GB');
  return date.split('/').join('-');
}