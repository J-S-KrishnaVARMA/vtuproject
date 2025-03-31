document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutLink = document.getElementById('logout-link');
    const bookingsLink = document.getElementById('bookings-link');
    const closeButtons = document.querySelectorAll('.close');
    const homeLink = document.getElementById('home-link');
    const moviesLink = document.getElementById('movies-link');
    const bookNowBtn = document.getElementById('book-now-btn');
    const exploreMoviesBtn = document.getElementById('explore-movies-btn');
    const homeSection = document.getElementById('home-section');
    const moviesSection = document.getElementById('movies-section');
    const bookingSection = document.getElementById('booking-section');
    const bookingsSection = document.getElementById('bookings-section');
    const userNav = document.getElementById('user-nav');
    const authNav = document.getElementById('auth-nav');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const bookingForm = document.getElementById('booking-form');
    const moviesContainer = document.getElementById('movies-container');
    const bookingsContainer = document.getElementById('bookings-container');
    const seatsContainer = document.getElementById('seats-container');
    const seatsGrid = document.getElementById('seats-grid');
    const selectedSeatsDisplay = document.getElementById('selected-seats-display');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const movieSelect = document.getElementById('movie');
    const theaterSelect = document.getElementById('theater');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const seatsInput = document.getElementById('seats');
    const experienceSelect = document.getElementById('experience');

    // State
    let currentUser = null;
    let selectedSeats = [];
    let currentShowing = null;

    // Initialize
    setupDateInput();
    checkAuthState();
    loadMovies();

    // Event Listeners
    loginLink.addEventListener('click', openLoginModal);
    signupLink.addEventListener('click', openSignupModal);
    logoutLink.addEventListener('click', logout);
    bookingsLink.addEventListener('click', showBookings);
    homeLink.addEventListener('click', showHome);
    moviesLink.addEventListener('click', showMovies);
    bookNowBtn.addEventListener('click', showBooking);
    exploreMoviesBtn.addEventListener('click', showMovies);

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === signupModal) {
            signupModal.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    bookingForm.addEventListener('submit', handleBookingStep1);
    confirmBookingBtn.addEventListener('click', confirmBooking);

    // Functions
    function setupDateInput() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const minDate = yyyy + '-' + mm + '-' + dd;
        dateInput.min = minDate;
        dateInput.value = minDate;
    }

    function checkAuthState() {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token with backend
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Not authenticated');
            })
            .then(data => {
                currentUser = data.user;
                authNav.style.display = 'none';
                userNav.style.display = 'flex';
            })
            .catch(error => {
                localStorage.removeItem('token');
                currentUser = null;
                authNav.style.display = 'flex';
                userNav.style.display = 'none';
            });
        } else {
            currentUser = null;
            authNav.style.display = 'flex';
            userNav.style.display = 'none';
        }
    }

    function loadMovies() {
        fetch('/api/movies')
            .then(response => response.json())
            .then(movies => {
                moviesContainer.innerHTML = '';
                movies.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    movieCard.innerHTML = `
                        <img src="/posters/${movie.poster}" alt="${movie.title}" class="movie-poster">
                        <div class="movie-info">
                            <h3 class="movie-title">${movie.title}</h3>
                            <div class="movie-meta">
                                <span>${movie.duration}</span>
                                <span class="movie-rating">★ ${movie.rating}</span>
                            </div>
                            <button class="btn book-movie-btn" data-id="${movie.id}">Book Tickets</button>
                        </div>
                    `;
                    moviesContainer.appendChild(movieCard);
                });

                // Add event listeners to book buttons
                document.querySelectorAll('.book-movie-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const movieId = this.getAttribute('data-id');
                        showBookingForMovie(movieId);
                    });
                });

                // Populate movie select in booking form
                movieSelect.innerHTML = '';
                movies.forEach(movie => {
                    const option = document.createElement('option');
                    option.value = movie.id;
                    option.textContent = movie.title;
                    movieSelect.appendChild(option);
                });
            });
    }

    function openLoginModal() {
        loginModal.style.display = 'block';
        signupModal.style.display = 'none';
    }

    function openSignupModal() {
        signupModal.style.display = 'block';
        loginModal.style.display = 'none';
    }

    function showHome() {
        homeSection.style.display = 'flex';
        moviesSection.style.display = 'none';
        bookingSection.style.display = 'none';
        bookingsSection.style.display = 'none';
    }

    function showMovies() {
        homeSection.style.display = 'none';
        moviesSection.style.display = 'block';
        bookingSection.style.display = 'none';
        bookingsSection.style.display = 'none';
    }

    function showBooking() {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        homeSection.style.display = 'none';
        moviesSection.style.display = 'none';
        bookingSection.style.display = 'block';
        bookingsSection.style.display = 'none';
        seatsContainer.style.display = 'none';
        confirmBookingBtn.style.display = 'none';
    }

    function showBookingForMovie(movieId) {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        showBooking();
        movieSelect.value = movieId;
        // Trigger change to load theaters and times
        const event = new Event('change');
        movieSelect.dispatchEvent(event);
    }

    function showBookings() {
        if (!currentUser) {
            openLoginModal();
            return;
        }
        homeSection.style.display = 'none';
        moviesSection.style.display = 'none';
        bookingSection.style.display = 'none';
        bookingsSection.style.display = 'block';
        loadUserBookings();
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            authNav.style.display = 'none';
            userNav.style.display = 'flex';
            loginModal.style.display = 'none';
            showHome();
        })
        .catch(error => {
            alert(error.message);
        });
    }

    function handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Signup failed');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            authNav.style.display = 'none';
            userNav.style.display = 'flex';
            signupModal.style.display = 'none';
            showHome();
        })
        .catch(error => {
            alert(error.message);
        });
    }

    function logout() {
        localStorage.removeItem('token');
        currentUser = null;
        authNav.style.display = 'flex';
        userNav.style.display = 'none';
        showHome();
    }

    function handleBookingStep1(e) {
        e.preventDefault();
        
        const movieId = movieSelect.value;
        const theaterId = theaterSelect.value;
        const date = dateInput.value;
        const time = timeSelect.value;
        
        // Store the current showing details
        currentShowing = { movieId, theaterId, date, time };
        
        // Load available seats for this showing
        fetch(`/api/showings/availability?movie=${movieId}&theater=${theaterId}&date=${date}&time=${time}`)
            .then(response => response.json())
            .then(data => {
                renderSeatsGrid(data.availableSeats, data.bookedSeats);
                seatsContainer.style.display = 'block';
                confirmBookingBtn.style.display = 'block';
            });
    }

    function renderSeatsGrid(availableSeats, bookedSeats) {
        seatsGrid.innerHTML = '';
        selectedSeats = [];
        selectedSeatsDisplay.textContent = 'Selected seats: None';
        
        // Create a grid of 100 seats (10x10)
        for (let i = 1; i <= 100; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = i;
            seat.dataset.number = i;
            
            if (bookedSeats.includes(i)) {
                seat.classList.add('booked');
                seat.title = 'Already booked';
            } else if (!availableSeats.includes(i)) {
                seat.style.visibility = 'hidden'; // Hide non-existent seats
            } else {
                seat.addEventListener('click', function() {
                    toggleSeatSelection(this);
                });
            }
            
            seatsGrid.appendChild(seat);
        }
    }

    function toggleSeatSelection(seatElement) {
        const seatNumber = parseInt(seatElement.dataset.number);
        const maxSeats = parseInt(seatsInput.value);
        
        if (seatElement.classList.contains('selected')) {
            // Deselect the seat
            seatElement.classList.remove('selected');
            selectedSeats = selectedSeats.filter(num => num !== seatNumber);
        } else {
            // Check if we can select more seats
            if (selectedSeats.length >= maxSeats) {
                alert(`You can only select up to ${maxSeats} seats`);
                return;
            }
            // Select the seat
            seatElement.classList.add('selected');
            selectedSeats.push(seatNumber);
        }
        
        // Update selected seats display
        if (selectedSeats.length > 0) {
            selectedSeatsDisplay.textContent = `Selected seats: ${selectedSeats.join(', ')}`;
        } else {
            selectedSeatsDisplay.textContent = 'Selected seats: None';
        }
    }

    function confirmBooking() {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        
        const experience = experienceSelect.value;
        const seats = selectedSeats;
        
        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...currentShowing,
                seats,
                experience
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Booking failed');
            }
            return response.json();
        })
        .then(data => {
            alert(`Booking confirmed! Your booking ID is ${data.booking.id}`);
            showBookings();
        })
        .catch(error => {
            alert(error.message);
        });
    }

    function loadUserBookings() {
        fetch('/api/bookings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(bookings => {
            bookingsContainer.innerHTML = '';
            
            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p>You have no bookings yet.</p>';
                return;
            }
            
            bookings.forEach(booking => {
                const bookingCard = document.createElement('div');
                bookingCard.className = 'booking-card';
                bookingCard.innerHTML = `
                    <h3 class="booking-title">${booking.movie_title}</h3>
                    <div class="booking-details">
                        <span class="booking-detail">${booking.theater_name}</span>
                        <span class="booking-detail">${new Date(booking.date).toLocaleDateString()}</span>
                        <span class="booking-detail">${booking.time}</span>
                        <span class="booking-detail">${booking.experience.toUpperCase()}</span>
                    </div>
                    <p class="booking-seats">Seats: ${JSON.parse(booking.seat_number).join(', ')}</p>
                `;
                bookingsContainer.appendChild(bookingCard);
            });
        });
    }

    // Load theaters when movie is selected
    movieSelect.addEventListener('change', function() {
        const movieId = this.value;
        if (!movieId) return;
        
        fetch(`/api/theaters?movie=${movieId}`)
            .then(response => response.json())
            .then(theaters => {
                theaterSelect.innerHTML = '';
                theaters.forEach(theater => {
                    const option = document.createElement('option');
                    option.value = theater.id;
                    option.textContent = theater.name;
                    theaterSelect.appendChild(option);
                });
                
                // Trigger change to load times
                if (theaters.length > 0) {
                    const event = new Event('change');
                    theaterSelect.dispatchEvent(event);
                }
            });
    });

    // Load times when theater is selected
    theaterSelect.addEventListener('change', function() {
        const movieId = movieSelect.value;
        const theaterId = this.value;
        const date = dateInput.value;
        if (!movieId || !theaterId) return;
        
        fetch(`/api/showings/times?movie=${movieId}&theater=${theaterId}&date=${date}`)
            .then(response => response.json())
            .then(times => {
                timeSelect.innerHTML = '';
                times.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    timeSelect.appendChild(option);
                });
            });
    });

    // Update seat selection when number of seats changes
    seatsInput.addEventListener('change', function() {
        if (selectedSeats.length > this.value) {
            alert(`You've already selected ${selectedSeats.length} seats. Reduce your selection first.`);
            this.value = selectedSeats.length;
            return;
        }
    });
});