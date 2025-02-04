(async function generateNavbar() {
    const navbarContainer = document.createElement('nav');
    navbarContainer.id = "dynamic-navbar";

    const repoOwner = "sahilkashyap64";
    const repoName = "letter-tracing";
    const branch = "main"; // Change if using a different branch

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
        let navbarHTML = `<ul>`;
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
