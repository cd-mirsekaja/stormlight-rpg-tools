// sphere value data in Diamond Marks
const currencies = [
	{ gemstone: 'Diamond', chip: 0.2, mark: 1, broam: 4 },
	{ gemstone: 'Garnet', chip: 1, mark: 5, broam: 20 },
	{ gemstone: 'Heliodor', chip: 1, mark: 5, broam: 20 },
	{ gemstone: 'Topaz', chip: 1, mark: 5, broam: 20 },
	{ gemstone: 'Ruby', chip: 2, mark: 10, broam: 40 },
	{ gemstone: 'Smokestone', chip: 2, mark: 10, broam: 40 },
	{ gemstone: 'Zircon', chip: 2, mark: 10, broam: 40 },
	{ gemstone: 'Amethyst', chip: 5, mark: 25, broam: 100 },
	{ gemstone: 'Sapphire', chip: 5, mark: 25, broam: 100 },
	{ gemstone: 'Emerald', chip: 10, mark: 50, broam: 200 }
];

// generate image path based on gemstone and type
function getImagePath(gemstone, type) {
	const typeMap = {
		'Chip': 'chip',
		'Mark': 'mark',
		'Broam': 'broam'
	};
	const imageType = typeMap[type] || type.toLowerCase();
	return `../images/spheres/${gemstone.toLowerCase()}_${imageType}.webp`;
}

function calculateCurrencies() {
	const errorDiv = document.getElementById('error');
	const amount = parseFloat(document.getElementById('amount').value);

	errorDiv.classList.remove('show');

	// validate value input
	if (isNaN(amount) || amount < 0) {
		errorDiv.textContent = 'Please enter a valid positive number.';
		errorDiv.classList.add('show');
		return;
	}

	if (amount === 0) {
		errorDiv.textContent = 'Please enter a value greater than 0.';
		errorDiv.classList.add('show');
		return;
	}

	// get min and max types constraints
	const minTypesInput = document.getElementById('minTypes').value;
	const maxTypesInput = document.getElementById('maxTypes').value;
	const minTypes = minTypesInput ? parseInt(minTypesInput) : null;
	const maxTypes = maxTypesInput ? parseInt(maxTypesInput) : null;

	// validate legality of min/max values
	if (minTypes && maxTypes && minTypes > maxTypes) {
		errorDiv.textContent = 'Minimum types cannot be greater than maximum types.';
		errorDiv.classList.add('show');
		return;
	}

	// calculate currency combination
	const result = generateCurrencyCombination(amount, minTypes, maxTypes);

	if (!result.success) {
		errorDiv.textContent = result.error;
		errorDiv.classList.add('show');
		document.getElementById('results').classList.remove('show');
		return;
	}

	// display results
	displayResults(result.combination, amount);
}

function generateCurrencyCombination(targetAmount, minTypes = null, maxTypes = null) {
	let remaining = targetAmount;
	const combination = [];
	const maxAttempts = 100;
	let attempts = 0;

	// retry until a valid combination is found or max attempts are reached
	while (attempts < maxAttempts) {
		remaining = targetAmount;
		combination.length = 0;
		attempts++;

		// shuffle currencies to add randomness
		const shuffledCurrencies = [...currencies].sort(() => Math.random() - 0.5);

		// distribution strategy: Marks → Chips → Broams
		for (const currency of shuffledCurrencies) {
			if (remaining < 0.01) break;

			// first try: use Marks
			const maxMarkQuantity = Math.floor(remaining / currency.mark);
			if (maxMarkQuantity > 0 && Math.random() < 0.5) {
				const markQuantity = maxMarkQuantity <= 3 ? maxMarkQuantity : Math.floor(Math.random() * (maxMarkQuantity - 1)) + 1;
				const markValue = markQuantity * currency.mark;

				if (markValue <= remaining + 0.01) {
					combination.push({
						gemstone: currency.gemstone,
						type: 'Mark',
						quantity: markQuantity,
						unitValue: currency.mark,
						totalValue: markValue,
						image: getImagePath(currency.gemstone, 'Mark')
					});
					remaining -= markValue;
					remaining = Math.round(remaining * 100) / 100;
				}
			}
		}

		for (const currency of shuffledCurrencies) {
			if (remaining < 0.01) break;

			// second try: use Chips
			const maxChipQuantity = Math.floor(remaining / currency.chip);
			if (maxChipQuantity > 0 && Math.random() < 0.5) {
				const chipQuantity = maxChipQuantity <= 3 ? maxChipQuantity : Math.floor(Math.random() * (maxChipQuantity - 1)) + 1;
				const chipValue = chipQuantity * currency.chip;

				if (chipValue <= remaining + 0.01) {
					combination.push({
						gemstone: currency.gemstone,
						type: 'Chip',
						quantity: chipQuantity,
						unitValue: currency.chip,
						totalValue: chipValue,
						image: getImagePath(currency.gemstone, 'Chip')
					});
					remaining -= chipValue;
					remaining = Math.round(remaining * 100) / 100;
				}
			}
		}

		for (const currency of shuffledCurrencies) {
			if (remaining < 0.01) break;

			// third try: use Broams
			const maxBroamQuantity = Math.floor(remaining / currency.broam);
			if (maxBroamQuantity > 0 && Math.random() < 0.3) {
				const broamQuantity = maxBroamQuantity <= 3 ? maxBroamQuantity : Math.floor(Math.random() * (maxBroamQuantity - 1)) + 1;
				const broamValue = broamQuantity * currency.broam;

				if (broamValue <= remaining + 0.01) {
					combination.push({
						gemstone: currency.gemstone,
						type: 'Broam',
						quantity: broamQuantity,
						unitValue: currency.broam,
						totalValue: broamValue,
						image: getImagePath(currency.gemstone, 'Broam')
					});
					remaining -= broamValue;
					remaining = Math.round(remaining * 100) / 100;
				}
			}
		}

		// check if exact or near-exact match was found
		if (Math.abs(remaining) < 0.01) {
			// validate if combination meets min/max type constraints
			const uniqueTypes = combination.length;
			
			if (minTypes && uniqueTypes < minTypes) {
				continue; // Try again, didn't meet minimum
			}
			
			if (maxTypes && uniqueTypes > maxTypes) {
				continue; // Try again, exceeded maximum
			}

			// sort by type priority: Marks → Chips → Broams
			const typePriority = { 'Mark': 0, 'Chip': 1, 'Broam': 2 };
			combination.sort((a, b) => typePriority[a.type] - typePriority[b.type]);

			return {
				success: true,
				combination: combination
			};
		}
	}

	let constraintMsg = '';
	if (minTypes && maxTypes) {
		constraintMsg = ` with ${minTypes}-${maxTypes} different currency types`;
	} else if (minTypes) {
		constraintMsg = ` with at least ${minTypes} different currency types`;
	} else if (maxTypes) {
		constraintMsg = ` with max ${maxTypes} different currency types`;
	}

	return {
		success: false,
		error: `Could not create exact combination for ${targetAmount}${constraintMsg}. Try a different amount or adjust the currency type constraints.`
	};
}

function displayResults(combination, targetAmount) {
	const resultsList = document.getElementById('resultsList');
	const totalValue = document.getElementById('totalValue');
	const resultsDiv = document.getElementById('results');

	resultsList.innerHTML = '';
	let total = 0;

	combination.forEach(item => {
		const itemDiv = document.createElement('div');
		itemDiv.className = 'result-item';

		// Left section: image + name
		const leftDiv = document.createElement('div');
		leftDiv.className = 'result-item-left';

		// Image
		const img = document.createElement('img');
		img.src = item.image;
		img.alt = item.gemstone;
		leftDiv.appendChild(img);

		// Name
		const nameSpan = document.createElement('span');
		nameSpan.className = 'currency-name';
		nameSpan.textContent = `${item.quantity}x ${item.gemstone} ${item.type}${item.quantity > 1 ? 's' : ''}`;
		leftDiv.appendChild(nameSpan);

		itemDiv.appendChild(leftDiv);

		// Right section: value
		const valueSpan = document.createElement('span');
		valueSpan.className = 'currency-value';
		valueSpan.textContent = `${item.totalValue.toFixed(2)}`;
		itemDiv.appendChild(valueSpan);

		resultsList.appendChild(itemDiv);

		total += item.totalValue;
	});

	totalValue.textContent = total.toFixed(2);
	resultsDiv.classList.add('show');
}

// function for resetting the input fields and results
function resetForm() {
	document.getElementById('amount').value = '';
	document.getElementById('minTypes').value = '';
	document.getElementById('maxTypes').value = '';
	document.getElementById('results').classList.remove('show');
	document.getElementById('error').classList.remove('show');
	document.getElementById('amount').focus();
}

// hit enter to confirm
document.getElementById('amount').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		calculateCurrencies();
	}
});

// focus value input field on page load
window.addEventListener('load', function() {
	document.getElementById('amount').focus();
});