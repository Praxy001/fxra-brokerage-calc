// Function to fetch tenures for the selected scheme and update the dropdown
document.getElementById('scheme').addEventListener('change', async (e) => {
    const scheme = e.target.value; // Get selected scheme
    const tenureDropdown = document.getElementById('tenure');
    const resultDiv = document.getElementById('result');

    // Clear previous results and dropdown options
    resultDiv.innerText = '';
    tenureDropdown.innerHTML = '<option value="">Loading...</option>';

    try {
        console.log(`Fetching tenures for scheme: ${scheme}`); // Debugging log

        // Fetch tenures for the selected scheme
        const response = await fetch(`http://localhost:3000/simulator/${encodeURIComponent(scheme)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch tenures');
        }

        const data = await response.json();
        console.log('Tenures API response:', data); // Debugging log

        // Clear existing options and populate new options
        tenureDropdown.innerHTML = '';  // Clear the dropdown
        Object.keys(data.tenures).forEach((key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            tenureDropdown.appendChild(option);
        });
    } catch (err) {
        console.error('Error fetching tenures:', err);
        tenureDropdown.innerHTML = '<option value="">Error loading tenures</option>';
        resultDiv.innerText = 'Error loading tenures. Please try again.';
    }
});


// Function to calculate earnings based on user input
document.getElementById('simulator-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const scheme = document.getElementById('scheme').value;
    const amount = document.getElementById('amount').value;
    const tenureKey = document.getElementById('tenure').value;
    const resultDiv = document.getElementById('result');

    // Validate input
    if (!scheme || !amount || !tenureKey) {
        resultDiv.innerText = 'Please fill in all fields.';
        return;
    }

    try {
        console.log(`Calculating commission for: Scheme=${scheme}, Amount=${amount}, Tenure=${tenureKey}`); // Debugging info

        // Fetch calculated earnings
        const response = await fetch('/simulator/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheme, amount, tenureKey })
        });

        const result = await response.json();
        console.log('Calculation API response:', result); // Debugging info

        if (response.ok) {
            // Display calculation results
            resultDiv.innerText = `Total Earnings: ₹${result.totalEarnings}
  RedVision: ₹${result.redVisionEarnings}
  Fixerra: ₹${result.fixerraEarnings}
  MFD: ₹${result.mfdEarnings}`;
        } else {
            // Display server-side errors
            resultDiv.innerText = `Error: ${result.error}`;
        }
    } catch (err) {
        // Handle fetch or network errors
        console.error('Error calculating commission:', err);
        resultDiv.innerText = 'Error calculating commission. Please try again.';
    }
});
