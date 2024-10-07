document.getElementById('fileInput').addEventListener('change', handleFileUpload);

// Verifica se existe conteúdo salvo no cache ao carregar a página
window.addEventListener('load', function () {
    const cachedContent = localStorage.getItem('routesCache');
    if (cachedContent) {
        parseRoutes(cachedContent); // Carrega as rotas do cache
    }
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            
            // Salva o conteúdo do arquivo no cache
            localStorage.setItem('routesCache', fileContent);
            
            parseRoutes(fileContent); // Processa as rotas
        };
        reader.readAsText(file);
    }
}

function parseRoutes(content) {
    const prefixRegex = /Route::prefix\('([^']+)'\)/g;
    const routesRegex = /Route::(get|post|put|delete)\('([^']+)', \[([^\]]+)\]/gi;

    let prefix = '';
    const rotasContainer = document.getElementById('rotasContainer');
    rotasContainer.innerHTML = ''; // Limpa o container antes de adicionar novas rotas

    // Captura todos os prefixos antes de buscar as rotas
    while ((prefixMatch = prefixRegex.exec(content)) !== null) {
        prefix = prefixMatch[1]; // Atualiza o prefixo atual
    }

    let match;
    while ((match = routesRegex.exec(content)) !== null) {
        const method = match[1].toUpperCase(); // GET, POST, PUT, DELETE
        const route = match[2]; // /rota

        // Combina o prefixo com a rota
        const fullRoute = `${prefix}${route}`; // Endpoint completo

        const controller = match[3].split(',').map(s => s.trim()).join(' '); // Controller e método

        // Cria um elemento para a rota
        const routeItem = document.createElement('div');
        routeItem.classList.add('route-item');

        const routeDetails = document.createElement('div');
        routeDetails.classList.add('route-details');
        routeDetails.innerHTML = `<strong>Rota:</strong> ${fullRoute} <br> <strong>Método:</strong> ${method} <br> <strong>Controller:</strong> ${controller}`;

        const testButton = document.createElement('button');
        testButton.textContent = 'Testar Rota';
        testButton.addEventListener('click', function () {
            testRoute(method, fullRoute, routeItem); // Passa a rota completa e o item da rota
        });

        const responseContainer = document.createElement('div');
        responseContainer.classList.add('response-container');
        responseContainer.style.display = 'none'; // Esconde a resposta inicialmente

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fechar';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', function () {
            responseContainer.style.display = 'none'; // Oculta a caixa de resposta
        });

        responseContainer.appendChild(closeButton); // Adiciona o botão de fechar
        routeItem.appendChild(routeDetails);
        routeItem.appendChild(testButton);
        routeItem.appendChild(responseContainer); // Adiciona o container da resposta
        rotasContainer.appendChild(routeItem);
    }
}

function testRoute(method, route, routeItem) {
    const apiUrl = 'http://127.0.0.1:8000'; // Coloque aqui a URL da sua API

    fetch(`${apiUrl}${route}`, { method: method })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Mostra a resposta no dropdown
            const responseContainer = routeItem.querySelector('.response-container');
            responseContainer.style.display = 'block'; // Mostra o container
            responseContainer.innerHTML = `<strong>Resposta:</strong> <pre>${JSON.stringify(data, null, 2)}</pre>`;
            responseContainer.appendChild(routeItem.querySelector('.close-button')); // Adiciona o botão de fechar na resposta
        })
        .catch(error => {
            const responseContainer = routeItem.querySelector('.response-container');
            responseContainer.style.display = 'block'; // Mostra o container
            responseContainer.innerHTML = `<strong>Erro:</strong> ${error.message}`;
            responseContainer.appendChild(routeItem.querySelector('.close-button')); // Adiciona o botão de fechar na resposta
        });
}