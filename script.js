

const selectEstado = document.getElementById('estado')
const selectCidade = document.getElementById('cidade')
const qtdCidades = document.getElementById('qtdCidades')
const filtroCidade = document.getElementById('filtroCidade')
const resumo = document.getElementById('resumo')

const URL_ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'

let listaCidades = []


function carregarEstados() {
    fetch(URL_ESTADOS)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao carregar os estados')
            return resposta.json()
        })
        .then(estados => {
            console.log(estados)
            selectEstado.innerHTML = '<option value="">Selecione o estado</option>'

            estados.forEach(estado => {
                const option = document.createElement('option')
                option.value = estado.sigla
                option.textContent = estado.nome
                selectEstado.appendChild(option)
            })
        })
        .catch(erro => {
            selectEstado.innerHTML = '<option value="">Não foi possível carregar os estados</option>'
            qtdCidades.innerHTML = 'Erro ao conectar com a API do IBGE. Recarregue a página.'
            qtdCidades.className = 'erro'
            console.log(erro)
        })
}


selectEstado.addEventListener('change', () => {
    const uf = selectEstado.value
    listaCidades = []
    filtroCidade.value = ''
    filtroCidade.disabled = true
    qtdCidades.innerHTML = ''
    qtdCidades.className = ''

    if (uf === '') {
        selectCidade.innerHTML = '<option value="">Escolha um estado primeiro</option>'
        selectCidade.disabled = true
        return
    }

    selectCidade.innerHTML = '<option value="">Carregando...</option>'
    selectCidade.disabled = true

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao carregar as cidades')
            return resposta.json()
        })
        .then(cidades => {
            listaCidades = cidades
            preencherCidades(listaCidades)

            selectCidade.disabled = false
            filtroCidade.disabled = false

            qtdCidades.innerHTML = `${selectEstado.options[selectEstado.selectedIndex].text} tem <strong>${cidades.length}</strong> cidades.`
        })
        .catch(erro => {
            selectCidade.innerHTML = '<option value="">Não foi possível carregar as cidades</option>'
            qtdCidades.innerHTML = 'Erro ao buscar as cidades. Tente escolher o estado de novo.'
            qtdCidades.className = 'erro'
            console.log(erro)
        })
})

function preencherCidades(cidades) {
    selectCidade.innerHTML = cidades.length > 0
        ? '<option value="">Selecione a cidade</option>'
        : '<option value="">Nenhuma cidade encontrada</option>'

    cidades.forEach(cidade => {
        const option = document.createElement('option')
        option.value = cidade.nome
        option.textContent = cidade.nome
        selectCidade.appendChild(option)
    })
}


function semAcento(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

filtroCidade.addEventListener('input', () => {
    const busca = semAcento(filtroCidade.value.trim())
    const filtradas = listaCidades.filter(cidade => semAcento(cidade.nome).includes(busca))

    preencherCidades(filtradas)

    if (busca !== '') {
        qtdCidades.innerHTML = `<strong>${filtradas.length}</strong> de ${listaCidades.length} cidades encontradas.`
    } else {
        qtdCidades.innerHTML = `${selectEstado.options[selectEstado.selectedIndex].text} tem <strong>${listaCidades.length}</strong> cidades.`
    }
})


document.getElementById('formInscricao').addEventListener('submit', (evento) => {
    evento.preventDefault() 

    const nome = document.getElementById('nome').value.trim()
    const cidade = selectCidade.value
    const uf = selectEstado.value

    resumo.innerHTML = `<strong>${nome}</strong>, de ${cidade}/${uf}, inscrito com sucesso`
})

carregarEstados()
