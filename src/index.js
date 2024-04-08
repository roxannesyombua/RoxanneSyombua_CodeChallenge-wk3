// Your code here
document.addEventListener("DOMContentLoaded", function() {
    const dataBase = 'http://localhost:3000';

    // Function to fetch movie details by ID
    function fetchMovieDetails(movieId) {
        fetch(`${dataBase}/films/${movieId}`)
            .then(response => response.json())
            .then(data => {
                // Populate movie details on the page
                document.getElementById('movie-poster').src = data.poster;
                document.getElementById('movie-title').textContent = data.title;
                document.getElementById('movie-runtime').textContent = `Runtime: ${data.runtime} mins`;
                document.getElementById('movie-showtime').textContent = `Showtime: ${data.showtime}`;
                document.getElementById('movie-description').textContent = data.description;

                // Calculate and display available tickets
                const availableTickets = data.capacity - data.tickets_sold;
                document.getElementById('available-tickets').textContent = `Available Tickets: ${availableTickets}`;

                // Update Buy Ticket button state
                const buyTicketBtn = document.getElementById('buy-ticket-btn');
                if (availableTickets <= 0) {
                    buyTicketBtn.textContent = 'Sold Out';
                    buyTicketBtn.disabled = true;
                } else {
                    buyTicketBtn.textContent = 'Buy Ticket';
                    buyTicketBtn.disabled = false;
                }

                // Add event listener for Buy Ticket button
                buyTicketBtn.addEventListener('click', function() {
                    // Only proceed if tickets are available
                    if (availableTickets > 0) {
                        // Update tickets sold count on the server
                        fetch(`${dataBase}/films/${data.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                tickets_sold: data.tickets_sold + 1
                            })
                        })
                        .then(response => response.json())
                        .then(updatedMovie => {
                            // Update available tickets count on the frontend
                            document.getElementById('available-tickets').textContent = `Available Tickets: ${updatedMovie.capacity - updatedMovie.tickets_sold}`;
                            
                            // Check if movie is now sold out
                            if (updatedMovie.tickets_sold >= updatedMovie.capacity) {
                                buyTicketBtn.textContent = 'Sold Out';
                                buyTicketBtn.disabled = true;
                                document.querySelector(`#films li[data-id="${updatedMovie.id}"]`).classList.add('sold-out');
                            }
                        })
                        .catch(error => console.error('Error updating tickets sold:', error));
                    }
                });
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }

    // Function to fetch all movies
    function fetchAllMovies() {
        fetch(`${dataBase}/films`)
            .then(response => response.json())
            .then(data => {
                // Populate movie menu
                const filmsList = document.getElementById('films');
                filmsList.innerHTML = ''; // Clear existing list
                data.forEach(movie => {
                    const li = document.createElement('li');
                    li.textContent = movie.title;
                    li.classList.add('film-item');
                    li.dataset.id = movie.id;
                    li.addEventListener('click', function() {
                        fetchMovieDetails(movie.id);
                    });
                    filmsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    // Load first movie details on page load
    fetchMovieDetails(1);

    // Load all movies in the movie menu on page load
    fetchAllMovies();
});