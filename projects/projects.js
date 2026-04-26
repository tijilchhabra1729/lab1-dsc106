import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';

const projects = await fetchJSON(`${BASE_PATH}/lib/projects.json`);
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `Projects (${projects.length})`;
}
