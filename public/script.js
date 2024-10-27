
console.log("JavaScript file loaded");


document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent the form from submitting the traditional way

    const name = e.target.name.value;
    const email = e.target.email.value;

    try {
        const response = await fetch('http://localhost:3000/api/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        const result = await response.json();
        
        // Display success message on the page instead of JSON response
        if (result.success) {
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            successMessage.textContent = "🎉 Thank you for registering! 🎉"; // Custom success message

            // Clear the form
            e.target.reset();

            // Hide the success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    } catch (err) {
        console.error('Error saving data:', err);
    }
});
