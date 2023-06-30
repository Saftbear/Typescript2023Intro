describe('Videos page', () => {
  it('displays fetched videos correctly', () => {
    cy.visit('http://localhost:3000/'); // Visit the page that fetches and displays videos
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:3001/api/misc/get-videos',
      },
      {
        fixture: 'videos.json', // A file in the fixtures folder that contains the response
      }
    ).as('getVideos');

    cy.wait('@getVideos'); // Wait for the request to complete

    cy.fixture('videos.json').then((videos: any[]) => { // Load the fixture data
      for (let index = 0; index < videos.length; index++) {
        cy.get(`.video-card:nth-child(${index + 1}) .video-title`).should('have.text', videos[index].title);
        cy.get(`.video-card:nth-child(${index + 1}) .video-thumbnail`).should('have.attr', 'src', `http://localhost:3001/uploaded_files/Thumbnails/${videos[index].thumbnail}`);
        cy.get(`.video-card:nth-child(${index + 1}) .video-user`).should('have.text', `Uploaded by: ${videos[index].user}`);
      }
    });
  });
});
