(async function generateNavbar() {
    const navbarContainer = document.createElement('nav');
    navbarContainer.id = "dynamic-navbar";
  
    const repoOwner = "sahilkashyap64";
    const repoName = "letter-tracing";
    const branch = "main"; // Change if using a different branch
  
    // Basic CSS for the navbar
    const navbarStyle = `
      <style>
        #dynamic-navbar {
          background-color: #333;
          color: white;
          padding: 0.5em 1em;
          font-size: 1.1em;
          position: sticky; /* Stick to the top of the viewport */
          top: 0;
          z-index: 100; /* Ensure it's above other content */
        }
  
        #dynamic-navbar ul {
          list-style-type: none;
          margin: 0;
          padding: 0;
          display: flex;
          overflow-x: auto; /* Enable horizontal scrolling on small screens */
          white-space: nowrap; /* Prevent wrapping of list items */
        }
  
        #dynamic-navbar li {
          margin: 0;
        }
  
        #dynamic-navbar li a {
          display: block;
          color: white;
          text-align: center;
          padding: 0.5em 1em;
          text-decoration: none;
          border-radius: 5px;
        }
  
        #dynamic-navbar li a:hover {
          background-color: #555;
        }
  
        #dynamic-navbar li a.active {
          background-color: #4CAF50;
          color: white;
        }
  
        /* Media query for smaller screens */
        @media (max-width: 600px) {
          #dynamic-navbar {
            font-size: 0.9em;
            padding: 0.3em 0.5em;
          }
        }
      </style>
    `;
  
    try {
      // GitHub API URL to get repository contents
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;
      const response = await fetch(apiUrl);
      const files = await response.json();
  
      // Filter only HTML files
      const pages = files
        .filter(file => file.name.endsWith(".html"))
        .map(file => file.name)
        .sort(); // Sort for better organization
  
      // Get the current page name
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
  
      // Build Navbar
      let navbarHTML = `
        ${navbarStyle}
        <ul>
      `;
      pages.forEach(page => {
        const activeClass = page === currentPage ? 'class="active"' : '';
        navbarHTML += `<li><a href="${page}" ${activeClass}>${page.replace(".html", "")}</a></li>`;
      });
      navbarHTML += `</ul>`;
  
      navbarContainer.innerHTML = navbarHTML;
      document.body.insertBefore(navbarContainer, document.body.firstChild);
    } catch (error) {
      console.error("Failed to load navbar:", error);
    }
  })();