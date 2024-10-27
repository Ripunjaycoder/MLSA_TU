console.log("JavaScript file loaded");

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;

    console.log("Name:", name);
    console.log("Email:", email);

    try {
        const response = await fetch('/api/submit-form', {  // Updated to relative path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        const result = await response.json();

        if (result.success) {
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            successMessage.textContent = "🎉 Thank you for registering! 🎉";

            e.target.reset();

            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    } catch (err) {
        console.error('Error saving data:', err);
    }
});
