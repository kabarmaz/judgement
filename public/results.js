fetch('/results')
  .then(res => res.json())
  .then(data => {
    const directionCounts = {};
    const schellingCounts = {};
    const confidenceCounts = [0, 0, 0, 0, 0];

    data.forEach(session => {
      session.responses.forEach(r => {
        directionCounts[r.direction] = (directionCounts[r.direction] || 0) + 1;
        if (r.isSchelling) {
          schellingCounts[r.direction] = (schellingCounts[r.direction] || 0) + 1;
        }
        confidenceCounts[r.confidence - 1]++;
      });
    });

    new Chart(document.getElementById('summaryChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(directionCounts),
        datasets: [
          {
            label: 'Total Chosen',
            data: Object.values(directionCounts),
            backgroundColor: 'steelblue'
          },
          {
            label: 'Schelling Chosen',
            data: Object.keys(directionCounts).map(k => schellingCounts[k] || 0),
            backgroundColor: 'gold'
          }
        ]
      }
    });

    new Chart(document.getElementById('confidenceChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [{
          label: 'Confidence Ratings',
          data: confidenceCounts,
          backgroundColor: 'purple'
        }]
      }
    });
  });
