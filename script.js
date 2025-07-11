/**
 * =================================================================
 * Main Script for Interactive Portfolio
 * =================================================================
 * This script handles:
 * 1. Three.js 3D animated background.
 * 2. Intersection Observer for scroll-triggered animations.
 * 3. Sticky header and active navigation link highlighting.
 * 4. Contact form submission via EmailJS.
 * 5. Easter egg functionality on logo click.
 * =================================================================
 */

// --- 1. Three.js 3D Scene Setup ---

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Geometry: A galaxy of particles
const particleCount = 6000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    // Distribute particles in a spherical shape
    let i3 = i * 3;
    let theta = Math.acos((Math.random() * 2) - 1);
    let phi = Math.random() * Math.PI * 2;
    let radius = 5 + Math.random() * 15;

    positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = radius * Math.cos(theta);
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material for the particles
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x00abf0, // Corresponds to --main-color
    transparent: true,
    blending: THREE.AdditiveBlending,
});

// Create the points object
const starField = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starField);

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// --- Easter Egg State ---
let isLogoEffectActive = false;
const originalColor = new THREE.Color(0x00abf0);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Check if the easter egg effect is active
    if (isLogoEffectActive) {
        // Funky, fast rotation and color change
        starField.rotation.x += 0.005;
        starField.rotation.y += 0.01;
        particlesMaterial.color.setHSL(Math.random(), 1.0, 0.5);
    } else {
        // Normal, slow rotation
        starField.rotation.x += 0.0001;
        starField.rotation.y += 0.0002;
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 2. Intersection Observer for Scroll Animations ---
const hiddenElements = document.querySelectorAll('.about, .skills, .projects, .leadership, .contact');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

hiddenElements.forEach((el) => observer.observe(el));


// --- 3. Header and Navigation Logic ---
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');
let header = document.querySelector('header');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                let targetLink = document.querySelector('header nav a[href*=' + id + ']');
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            });
        };
    });

    header.classList.toggle('sticky', window.scrollY > 100);
};


// --- 4. Contact Form Functionality with EmailJS ---
(function() {
    /*******************************************************************
     * EMAILJS SETUP INSTRUCTIONS
     * -----------------------------------------------------------------
     * To make this form work, you need a free account from EmailJS.
     * 1. Go to https://www.emailjs.com and sign up.
     * 2. Add a new email service (e.g., Gmail).
     * 3. Create a new email template. Note the Template ID.
     * 4. Find your Public Key and Service ID in your account settings.
     * 5. Replace the placeholder values below with your actual keys.
     *******************************************************************/
    emailjs.init({
      publicKey: "MY_PUBLIC_KEY", // <-- PASTE YOUR PUBLIC KEY HERE
    });
})();

const contactForm = document.getElementById('contact-form');
const statusMessage = document.getElementById('status-message');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const submitBtn = this.querySelector('input[type="submit"]');
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    // These IDs from the EmailJS account page
    const serviceID = 'MY_SERVICE_ID'; // <-- PASTE YOUR SERVICE ID HERE
    const templateID = 'MY_TEMPLATE_ID'; // <-- PASTE YOUR TEMPLATE ID HERE

    // Check if placeholder values have been replaced
    if (serviceID === 'MY_SERVICE_ID' || templateID === 'MY_TEMPLATE_ID' || emailjs.config.publicKey === 'MY_PUBLIC_KEY') {
        statusMessage.innerHTML = "EmailJS is not configured.";
        statusMessage.style.color = '#ff4d4d'; // Error color
        submitBtn.value = 'Send Message';
        submitBtn.disabled = false;
        return; // Stop the function
    }

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            submitBtn.value = 'Send Message';
            submitBtn.disabled = false;
            statusMessage.innerHTML = "Message sent successfully!";
            statusMessage.style.color = '#00abf0'; // Success color
            contactForm.reset();
            setTimeout(() => {
                statusMessage.innerHTML = '';
            }, 5000); // Hide message after 5 seconds
        }, (err) => {
            submitBtn.value = 'Send Message';
            submitBtn.disabled = false;
            statusMessage.innerHTML = "Failed to send. Please try again.";
            statusMessage.style.color = '#ff4d4d'; // Error color
            console.error('EmailJS Error:', JSON.stringify(err));
            setTimeout(() => {
                statusMessage.innerHTML = '';
            }, 5000);
        });
});

// --- 5. Easter Egg on Logo Click ---
const logo = document.querySelector('.logo');

logo.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the link from navigating to '#'
    isLogoEffectActive = !isLogoEffectActive; // Toggle the effect

    // If the effect is turned off, reset the color to the original
    if (!isLogoEffectActive) {
        particlesMaterial.color.set(originalColor);
    }
});
