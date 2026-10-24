function getBlogs() {
    try {
        const blogs = JSON.parse(localStorage.getItem("blogspacePosts") || "[]");
        return Array.isArray(blogs) ? blogs : [];
    } catch {
        return [];
    }
}

function saveBlogs(blogs) {
    localStorage.setItem("blogspacePosts", JSON.stringify(blogs));
}

function createBlogCard(blog, showDelete = false) {
    const card = document.createElement("article");
    card.className = "blog-card";

    const image = document.createElement("div");
    image.className = "blog-image image-one";
    image.textContent = "✍️";

    const content = document.createElement("div");
    content.className = "blog-content";

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = blog.category;

    const title = document.createElement("h3");
    title.textContent = blog.title;

    const description = document.createElement("p");
    description.textContent = blog.content;

    content.append(category, title, description);

    if (showDelete) {
        const button = document.createElement("button");
        button.className = "delete-button";
        button.textContent = "Delete Blog";

        button.addEventListener("click", function () {
            const updated = getBlogs().filter(item => item.id !== blog.id);
            saveBlogs(updated);
            renderDashboard();
        });

        content.appendChild(button);
    }

    card.append(image, content);
    return card;
}

// Create and save a blog post
const blogForm = document.getElementById("blogForm");

if (blogForm) {
    blogForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const blog = {
            id: Date.now().toString(),
            title: document.getElementById("blogTitle").value.trim(),
            category: document.getElementById("blogCategory").value,
            content: document.getElementById("blogContent").value.trim(),
            date: new Date().toLocaleDateString()
        };

        if (!blog.title || !blog.category || !blog.content) {
            document.getElementById("blogMessage").textContent =
                "Please complete all fields.";
            return;
        }

        const blogs = getBlogs();
        blogs.unshift(blog);

        try {
            saveBlogs(blogs);
        } catch {
            document.getElementById("blogMessage").textContent =
                "Unable to save the post. Check your browser storage.";
            return;
        }

        window.location.href = "dashboard.html";
    });
}

// Display saved posts on the dashboard
function renderDashboard() {
    const container = document.getElementById("dashboardPosts");
    const empty = document.getElementById("dashboardEmpty");

    if (!container || !empty) return;

    container.replaceChildren();
    const blogs = getBlogs();

    empty.hidden = blogs.length > 0;

    blogs.forEach(blog => {
        container.appendChild(createBlogCard(blog, true));
    });
}

renderDashboard();

// Display saved posts on the homepage and enable search
const blogGrid = document.getElementById("blogGrid");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

if (blogGrid) {
    getBlogs().forEach(blog => {
        blogGrid.prepend(createBlogCard(blog));
    });
}

if (searchInput && blogGrid && emptyMessage) {
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        let visibleCount = 0;

        blogGrid.querySelectorAll(".blog-card").forEach(card => {
            const matches = card.textContent.toLowerCase().includes(query);
            card.hidden = !matches;

            if (matches) visibleCount++;
        });

        emptyMessage.hidden = visibleCount !== 0;
    });
}