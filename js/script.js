
// ======================================
// ANALÈTH PHOTOART
// Galeria fotográfica estudantil - NAVE
// ======================================

const API = "https://commons.wikimedia.org/w/api.php";

// Fotografias demonstrativas para o caso de a API falhar.
// Substitua por fotografias autorizadas do acervo estudantil.

let fotografias = [];
let categoriaAtual = "todas";

// ======================================
// FAVORITOS
// ======================================

function obterFavoritos() {

    return JSON.parse(
        localStorage.getItem("analeth_favoritos") || "[]"
    );

}

function salvarFavoritos(lista) {

    localStorage.setItem(
        "analeth_favoritos",
        JSON.stringify(lista)
    );

}

function alternarFavorito(id) {

    const favoritos = obterFavoritos();

    const existe = favoritos.some(
        foto => foto.id === id
    );

    let atualizados;

    if (existe) {

        atualizados = favoritos.filter(
            foto => foto.id !== id
        );

    } else {

        const foto = fotografias.find(
            foto => foto.id === id
        );

        if (!foto) return;

        atualizados = [...favoritos, foto];

    }

    salvarFavoritos(atualizados);

    atualizarGaleria();

}

// ======================================
// API EXTERNA
// Wikimedia Commons
// ======================================

async function buscarFotografias() {

    const galeria = document.getElementById(
        "galeria-container"
    );

    try {

        const parametros = new URLSearchParams({

            action: "query",
            format: "json",
            origin: "*",
            generator: "search",
            gsrsearch: "filetype:bitmap photography nature landscape",
            gsrnamespace: "6",
            gsrlimit: "24",
            prop: "imageinfo",
            iiprop: "url",
            iiurlwidth: "800"

        });

        const resposta = await fetch(
            `${API}?${parametros}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao acessar a API");
        }

        const dados = await resposta.json();

        const paginas = Object.values(
            dados.query?.pages || {}
        );

        fotografias = paginas
            .filter(pagina => pagina.imageinfo?.[0]?.thumburl)
            .map(pagina => ({

                id: "commons-" + pagina.pageid,

                titulo: pagina.title
                    .replace("File:", "")
                    .replace(/_/g, " "),

                categoria: "natureza",

                autor: "Imagem externa de referência",

                url: pagina.imageinfo[0].thumburl,

                origem: pagina.imageinfo[0].descriptionurl

            }));

        if (fotografias.length === 0) {
            throw new Error("Nenhuma imagem encontrada");
        }

        const aviso = document.getElementById(
            "mensagem-api"
        );

        if (aviso) {
            aviso.textContent =
                "Imagens externas de referência carregadas pela API Wikimedia Commons. Elas não representam necessariamente trabalhos de estudantes do NAVE.";
        }

    } catch (erro) {

        console.log("API indisponível:", erro);

        fotografias = imagensAlternativas;

        const aviso = document.getElementById(
            "mensagem-api"
        );

        if (aviso) {
            aviso.textContent =
                "Não foi possível conectar à API. Exibindo imagens demonstrativas alternativas.";
        }

    }

    atualizarGaleria();

}

// ======================================
// CRIAÇÃO DOS CARDS
// ======================================

function criarCard(foto) {

    const favoritos = obterFavoritos();

    const salvo = favoritos.some(
        item => item.id === foto.id
    );

    const card = document.createElement("article");

    card.className = "foto-card";

    const imagem = document.createElement("img");

    imagem.src = foto.url;
    imagem.alt = foto.titulo;
    imagem.loading = "lazy";

    imagem.addEventListener("error", () => {
        imagem.alt = "Imagem indisponível";
    });

    imagem.addEventListener("click", () => {
        abrirModal(foto);
    });

    const informacoes = document.createElement("div");

    informacoes.className = "foto-informacoes";

    const titulo = document.createElement("h3");
    titulo.textContent = foto.titulo;

    const descricao = document.createElement("p");

    descricao.textContent =
        "Fotografia para apreciação e inspiração visual.";

    const autor = document.createElement("div");

    autor.className = "foto-autor";

    autor.textContent = foto.autor;

    const acoes = document.createElement("div");

    acoes.className = "foto-acoes";

    const botao = document.createElement("button");

    botao.textContent = salvo
        ? "♥ Salvo"
        : "♡ Favoritar";

    botao.addEventListener("click", () => {

        alternarFavorito(foto.id);

    });

    acoes.appendChild(botao);

    if (foto.origem) {

        const link = document.createElement("a");

        link.href = foto.origem;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ver origem";
        link.style.fontSize = "11px";
        link.style.color = "#63876a";

        acoes.appendChild(link);

    }

    informacoes.appendChild(titulo);
    informacoes.appendChild(descricao);
    informacoes.appendChild(autor);
    informacoes.appendChild(acoes);

    card.appendChild(imagem);
    card.appendChild(informacoes);

    return card;

}


// ======================================
// PESQUISA
// ======================================

function configurarPesquisa() {

    const campo = document.getElementById(
        "pesquisa"
    );

    if (!campo) return;

    campo.addEventListener("input", () => {

        atualizarGaleria();

    });

}

// ======================================
// MODAL
// ======================================

function abrirModal(foto) {

    const modal = document.getElementById(
        "modal-foto"
    );

    const conteudo = document.getElementById(
        "conteudo-modal"
    );

    if (!modal || !conteudo) return;

    conteudo.innerHTML = "";

    const imagem = document.createElement("img");

    imagem.src = foto.url;
    imagem.alt = foto.titulo;

    const legenda = document.createElement("p");

    legenda.textContent =
        foto.titulo + " — " + foto.autor;

    conteudo.appendChild(imagem);
    conteudo.appendChild(legenda);

    modal.classList.add("aberto");

}

function configurarModal() {

    const modal = document.getElementById(
        "modal-foto"
    );

    const fechar = document.getElementById(
        "fechar-modal"
    );

    if (!modal || !fechar) return;

    fechar.addEventListener("click", () => {

        modal.classList.remove("aberto");

    });

    modal.addEventListener("click", evento => {

        if (evento.target === modal) {

            modal.classList.remove("aberto");

        }

    });

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            modal.classList.remove("aberto");

        }

    });

}

// ======================================
// PÁGINA DE FAVORITOS
// ======================================

function carregarFavoritos() {

    const container = document.getElementById(
        "favoritos-container"
    );

    if (!container) return;

    const favoritos = obterFavoritos();

    fotografias = favoritos;

    container.innerHTML = "";

    if (favoritos.length === 0) {

        container.innerHTML = `
            <div class="sem-fotos">
                <h3>Nenhuma fotografia salva ainda.</h3>
                <p>Explore a galeria e escolha suas favoritas!</p>
                <br>
                <a href="galeria.html">Conhecer galeria →</a>
            </div>
        `;

        return;

    }

    favoritos.forEach(foto => {

        container.appendChild(
            criarCard(foto)
        );

    });

}

// ======================================
// INICIALIZAÇÃO
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const pagina = document.body.dataset.page;

    if (pagina === "galeria") {

        configurarFiltros();

        configurarPesquisa();

        configurarModal();

        buscarFotografias();

    }

    if (pagina === "favoritos") {

        carregarFavoritos();

    }

});






