import { fetchJSON, renderProjects, BASE_PATH } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const projects = await fetchJSON(`${BASE_PATH}/lib/projects.json`);
const projectsContainer = document.querySelector('.projects');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `Projects (${projects.length})`;
}

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal(d3.schemeTableau10);

let selectedIndex = -1;
let query = '';
let currentPieData = [];

function filterProjects() {
    let filtered = projects;
    if (query) {
        filtered = filtered.filter((project) => {
            return Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase());
        });
    }
    if (selectedIndex !== -1 && currentPieData[selectedIndex]) {
        const selectedYear = currentPieData[selectedIndex].label;
        filtered = filtered.filter((p) => p.year === selectedYear);
    }
    return filtered;
}

function renderPieChart(projectsGiven) {
    const rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    const data = rolledData.map(([year, count]) => ({ value: count, label: year }));
    currentPieData = data;

    const sliceGenerator = d3.pie().value((d) => d.value);
    const arcData = sliceGenerator(data);
    const arcs = arcData.map((d) => arcGenerator(d));

    const svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();
    const legendEl = d3.select('.legend');
    legendEl.selectAll('li').remove();

    arcs.forEach((arc, i) => {
        svg
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .attr('class', i === selectedIndex ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;

                svg.selectAll('path').attr('class', (_, idx) =>
                    idx === selectedIndex ? 'selected' : ''
                );
                legendEl.selectAll('li').attr('class', (_, idx) =>
                    idx === selectedIndex ? 'legend-item selected' : 'legend-item'
                );

                renderProjects(filterProjects(), projectsContainer, 'h2');
            });
    });

    data.forEach((d, i) => {
        legendEl
            .append('li')
            .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
            .attr('style', `--color:${colors(i)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

renderPieChart(projects);
renderProjects(projects, projectsContainer, 'h2');

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    selectedIndex = -1;
    const filteredProjects = filterProjects();
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
