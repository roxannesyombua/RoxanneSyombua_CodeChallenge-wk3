// Your code here
document.addEventListener('DOMContentLoaded', () => {
    // Get all the references to the HTML elements
    const filmsList = document.getElementById('films');
    const filmDetails = document.getElementById('showing');
    const posterImage = document.getElementById('poster');

    let currentMovieId;

    // Function to fetch and display the details of a movie by its ID
    function displayMovieDetails(movieId) {
        // Fetch the details of the movie
        fetch(`http://localhost:3000/films/${movieId}`)
            .then(response => response.json())
            .then(movie => {
                // Calculate the number of available tickets
                const availableTickets = movie.capacity - movie.tickets_sold;

                // Display the details of the movie
                filmDetails.innerHTML = `
                    <div class="card">
                        <div class="content">
                            <div class="header">${movie.title}</div>
                            <div class="meta">${movie.runtime} minutes</div>
                            <div class="description">${movie.description}</div>
                            <div class="extra">
                            <span class="ui label">${movie.showtime}</span>
                            <span id="ticket-num">${availableTickets}</span> remaining tickets
                        </div>
                    </div>
                    <div class="extra content">
                        <button class="ui orange button buy-ticket" data-id="${movie.id}" ${availableTickets === 0 ? 'disabled' : ''}>
                            ${availableTickets === 0 ? 'Sold Out' : 'Buy Ticket'}
                        </button>
                    </div>
                `;

                // Update the poster image
                posterImage.src = movie.poster;
                posterImage.alt = movie.title;

                // Update the current movie ID
                currentMovieId = movieId;
            })
    }

    // Function to display all the movies 
    function displayAllMovies() {
        // Fetch the details of the movie
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(movies => {
                // Clear the movies list section
                filmsList.innerHTML = '';
                // Iterate through the list of movies 
                movies.forEach(movie => {
                    // Create a list item for each movie
                    const listItem = document.createElement('li');
                    listItem.className = 'film item';
                    listItem.textContent = movie.title;

                    // Add sold-out class if the movie is sold out
                    if (movie.tickets_sold === movie.capacity) {
                        listItem.classList.add('sold-out');
                    }

                    // Create a delete button for each movie
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.className = 'ui delete-movie';
                    deleteButton.setAttribute('data-id', movie.id);

                    // Event listener for delete button
                    deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        const movieId = event.target.dataset.id;
                        fetch(`http://localhost:3000/films/${movieId}`, {
                            method: 'DELETE'
                        })
                            .then(() => {
                                // After successfully deleting the movie, re-display all movies
                                displayAllMovies();
                            });
                    });

                    // Append delete button to the list item
                    listItem.appendChild(deleteButton);

                    // Event listener to display movie details 
                    listItem.addEventListener('click', () => {
                        displayMovieDetails(movie.id);
                    });

                    // Append list item to the films list
                    filmsList.appendChild(listItem);
                });

                // Display details of the first movie
                if (movies.length > 0) {
                    displayMovieDetails(movies[0].id);
                }
            })
    }

    // Event listener to buy ticket
    filmDetails.addEventListener('click', e => {
        if (e.target.classList.contains('buy-ticket')) {
            const filmId = e.target.dataset.id;
            fetch(`http://localhost:3000/films/${filmId}`)
                .then(response => response.json())
                .then(movie => {
                    // Check if tickets are available
                    if (movie.tickets_sold < movie.capacity) {
                        // Calculate updated tickets sold and available tickets
                        const updatedTicketsSold = movie.tickets_sold + 1;

                        // Update tickets_sold in the database
                        fetch(`http://localhost:3000/films/${filmId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                tickets_sold: updatedTicketsSold,
                            })
                        })
                            .then(() => {
                                // Update UI after buying ticket
                                displayMovieDetails(filmId);
                                displayAllMovies();
                            })
                            .catch(error => {
                                console.error('Error updating tickets:', error);
                            });
                    } else {
                        console.log('No available tickets');
                    }
                })
        }
    });

    // Initial function call to display all movies
    displayAllMovies();
});