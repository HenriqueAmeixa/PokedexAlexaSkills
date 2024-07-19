/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const AWS = require("aws-sdk");
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const Pokemon =  require('./models/pokemon.js');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá, bem-vindo à Pokedex.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const CadastrarPokemonIntentHandler = {
    canHandle(handlerInput) {
        console.log('Entrou na função CadastrarPokemonIntentHandler');
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CadastrarPokemonIntent';
    },
    async handle(handlerInput) {
        console.log('Inserindo valores do Pokemon: ');
        const { name, type, number, abilities, evolution } = handlerInput.requestEnvelope.request.intent.slots;
        console.log('Valores inseridos do Pokemon: ');
        console.log('Criando Pokemon ');
        console.log('Valores: '+ name.value, type.value.split(','), parseInt(number.value), abilities.value.split(','), evolution.value)
        try{
            const newPokemon = new Pokemon(name.value, type.value.split(','), parseInt(number.value), abilities.value.split(','), evolution.value);
            var pokemon = {
                'name': name.value,
                'type': type.value.split(','),
                'number': parseInt(number.value),
                'abilities': abilities.value.split(','),
                'evolution': evolution.value
            }
            console.log('Valor Pokemon: '+ pokemon);
            var dados = await handlerInput.attributesManager.getPersistentAttributes();
            console.log('Dados: '+ dados)
            if(Array.isArray(dados)){
                console.log('Entrou no if');
                dados.push(newPokemon);
            }
            else{
                console.log('Entrou no else');
                dados = [newPokemon];
            }
            handlerInput.attributesManager.setPersistentAttributes(dados);
            await handlerInput.attributesManager.savePersistentAttributes();
            
            console.log('Novo pokemon conseguiu construir');
            console.log(newPokemon);
        }
        catch(error){
            console.error("An error occurred while creating the Pokemon object:", error.message);
            console.error("Stack trace:", error.stack);
        }
        

        const speakOutput = `Pokémon ${name.value} cadastrado com sucesso!`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const ExcluirPokemonIntentHandler = {
    canHandle(handlerInput) {
        console.log('Entrou na função ExcluirPokemonIntentHandler');
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExcluirPokemonIntent';
    },
    async handle(handlerInput) {
        const nomeSlot = handlerInput.requestEnvelope.request.intent.slots.name.value; // Pegando o valor do slot 'nome'
        console.log('Nome do pokemon a ser excluído: ' + nomeSlot);
        let speakOutput = '';
        let dados = await handlerInput.attributesManager.getPersistentAttributes();
        console.log('Dados antes da exclusão: ', JSON.stringify(dados));

        if (Array.isArray(dados)) {
            const index = dados.findIndex(pokemon => pokemon.name.toLowerCase() === nomeSlot.toLowerCase());
            
            if (index !== -1) {
                const excluido = dados.splice(index, 1);
                console.log('Pokemon excluído: ', excluido);
                speakOutput = `O Pokémon chamado ${nomeSlot} foi excluído com sucesso.`;
                
                // Salva os dados atualizados
                handlerInput.attributesManager.setPersistentAttributes(dados);
                await handlerInput.attributesManager.savePersistentAttributes();
            } else {
                speakOutput = `Não foi encontrado nenhum Pokémon chamado ${nomeSlot}.`;
            }
        } else {
            console.log('Nenhum dado encontrado');
            speakOutput = `Não foi encontrado nenhum Pokémon chamado ${nomeSlot}.`;
        }
        
        console.log('Dados após a exclusão: ', JSON.stringify(dados));
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AtualizarInformacoesDoPokemonIntentHandler = {
    canHandle(handlerInput) {
        console.log('Entrou na função AtualizarInformacoesDoPokemonIntentHandler');
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AtualizarInformacoesDoPokemonIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const nome = slots.name.value;
        const tipo = slots.type ? slots.tipo.value.split(',') : null;
        const numero = slots.number ? parseInt(slots.numero.value) : null;
        const habilidades = slots.abilities ? slots.abilities.value.split(',') : null;
        const evolucao = slots.evolution ? slots.evolution.value : null;

        console.log('Nome do pokemon a ser atualizado: ' + nome);
        console.log('Novos valores - Tipo: ' + tipo + ', Número: ' + numero + ', Habilidades: ' + habilidades + ', Evolução: ' + evolucao);

        let speakOutput = '';
        let dados = await handlerInput.attributesManager.getPersistentAttributes();
        console.log('Dados antes da atualização: ', JSON.stringify(dados));

        if (Array.isArray(dados)) {
            const index = dados.findIndex(pokemon => pokemon.name.toLowerCase() === nome.toLowerCase());
            
            if (index !== -1) {
                if (tipo) dados[index].type = tipo;
                if (numero) dados[index].number = numero;
                if (habilidades) dados[index].abilities = habilidades;
                if (evolucao) dados[index].evolution = evolucao;

                console.log('Pokemon atualizado: ', dados[index]);
                speakOutput = `O Pokémon chamado ${nome} foi atualizado com sucesso.`;
                
                // Salva os dados atualizados
                handlerInput.attributesManager.setPersistentAttributes(dados);
                await handlerInput.attributesManager.savePersistentAttributes();
            } else {
                speakOutput = `Não foi encontrado nenhum Pokémon chamado ${nome}.`;
            }
        } else {
            console.log('Nenhum dado encontrado');
            speakOutput = `Não foi encontrado nenhum Pokémon chamado ${nome}.`;
        }
        
        console.log('Dados após a atualização: ', JSON.stringify(dados));
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const BuscarPokemonPorTipoIntentHandler = {
    canHandle(handlerInput) {
        console.log('Entrou na função BuscarPokemonPorTipoIntentHandler');
        const request = handlerInput.requestEnvelope.request;
        console.log('Request Type: ' + Alexa.getRequestType(handlerInput.requestEnvelope));
        console.log('Intent Name: ' + Alexa.getIntentName(handlerInput.requestEnvelope));
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuscarPokemonPorTipoIntent';
    },
    async handle(handlerInput) {
        const typeFind = handlerInput.requestEnvelope.request.intent.slots.type.value; // Supondo que o slot se chame "tipo"
        console.log('Tipo do pokemon a ser buscado: ' + typeFind);
        let speakOutput = '';
        const dados = await handlerInput.attributesManager.getPersistentAttributes();
        console.log('Dados: ', JSON.stringify(dados));
        
        const resultado = [];
        
        if (Array.isArray(dados)) {
            for (let i = 0; i < dados.length; i++) {
                const item = dados[i]; // Acessa o objeto dentro de cada item
                const tipos = item.type; // Acessa o array de tipos
                
                for (let j = 0; j < tipos.length; j++) {
                    if (tipos[j] === typeFind) {
                        resultado.push(item);
                        console.log('Pokemon encontrado: ', item);
                        break;
                    }
                }
            }
            
            if (resultado.length > 0) {
                speakOutput = 'Foram encontrados os seguintes pokemons do tipo pesquisado: ' + resultado.map(pokemon => pokemon.name).join(', ');
            } else {
                speakOutput = 'Nenhum pokemon encontrado para o tipo ' + typeFind;
            }
        } else {
            console.log('Nenhum dado encontrado');
            speakOutput = 'Nenhum pokemon encontrado para o tipo ' + typeFind;
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();    
    }
};

const BuscarPokemonPorNomeIntentHandler = {
    canHandle(handlerInput) {
        console.log('Entrou na função BuscarPokemonPorNomeIntentHandler');
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuscarPokemonPorNomeIntent';
    },
    async handle(handlerInput) {
        const nomeSlot = handlerInput.requestEnvelope.request.intent.slots.name.value; // Pegando o valor do slot 'nome'
        console.log('Nome do pokemon a ser buscado: ' + nomeSlot);
        let speakOutput = '';
        const dados = await handlerInput.attributesManager.getPersistentAttributes();
        console.log('Dados: ', JSON.stringify(dados));

        const resultado = [];
        
        if (Array.isArray(dados)) {
            for (let i = 0; i < dados.length; i++) {
                const item = dados[i]; // Acessa o objeto dentro de cada item
                
                if (item.name.toLowerCase() === nomeSlot.toLowerCase()) {
                    resultado.push(item);
                    console.log('Pokemon encontrado: ', item);
                }
            }

            if (resultado.length > 0) {
                speakOutput = 'O Pokémon chamado ' + nomeSlot + ' de numero ' + resultado[0].number + ' é do tipo ' + resultado[0].type.join(', ') +
                              ' e suas habilidades são ' + resultado[0].abilities.join(', ') + '.';
            } else {
                speakOutput = 'Nenhum Pokémon encontrado com o nome ' + nomeSlot;
            }
        } else {
            console.log('Nenhum dado encontrado');
            speakOutput = 'Nenhum Pokémon encontrado com o nome ' + nomeSlot;
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const ConsultarEvolucoesDoPokemonIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConsultarEvolucoesDoPokemonIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;
        const { name } = requestEnvelope.request.intent.slots;
        
        if (!name || !name.value) {
            return handlerInput.responseBuilder
                .speak('Por favor, especifique o nome do Pokémon para consultar suas evoluções.')
                .getResponse();
        }
        
        const pokemonName = name.value.toLowerCase();
        
        // Atributos persistentes com os dados dos Pokémon
        const dados = await attributesManager.getPersistentAttributes();
        console.log('Dados: ', JSON.stringify(dados));
        if (!dados || !Array.isArray(dados) || dados.length === 0) {
            return handlerInput.responseBuilder
                .speak('Não há dados de Pokémon armazenados.')
                .getResponse();
        }
        
        // Procurar o Pokémon nos dados persistentes
        console.log('Buscando pokemon');
        
        const resultado = [];
        
        if (Array.isArray(dados)) {
            for (let i = 0; i < dados.length; i++) {
                const item = dados[i]; // Acessa o objeto dentro de cada item
                
                if (item.name.toLowerCase() === pokemonName.toLowerCase()) {
                    resultado.push(item);
                    console.log('Pokemon encontrado: ', item);
                }
            }
        }

        console.log('Resultado: ', JSON.stringify(resultado));
        console.log('Pokemon encontrado: ' + resultado);
        
        if (!resultado) {
            return handlerInput.responseBuilder
                .speak(`Não foi encontrado nenhum Pokémon chamado ${name.value}.`)
                .getResponse();
        }
        
        const evolutions = resultado[0].evolution.split(' ').join(', '); // Transforma em uma lista separada por vírgula
        
        if (!evolutions || evolutions.length === 0) {
            return handlerInput.responseBuilder
                .speak(`O Pokémon ${name.value} não possui evoluções registradas.`)
                .getResponse();
        }
        
        // Gerar a resposta com as evoluções do Pokémon
        let speechOutput = `As evoluções do Pokémon ${name.value} são: ${evolutions}.`;
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};

const ConsultarHabilidadesDoPokemonIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConsultarHabilidadesDoPokemonIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;
        const { name } = requestEnvelope.request.intent.slots;
        
        if (!name || !name.value) {
            return handlerInput.responseBuilder
                .speak('Por favor, especifique o nome do Pokémon para consultar suas habilidades.')
                .getResponse();
        }
        
        const pokemonName = name.value.toLowerCase();
        
        // Atributos persistentes com os dados dos Pokémon
        const dados = await attributesManager.getPersistentAttributes();
        
        if (!dados || !Array.isArray(dados) || dados.length === 0) {
            return handlerInput.responseBuilder
                .speak('Não há dados de Pokémon armazenados.')
                .getResponse();
        }
                const resultado = [];
        
        if (Array.isArray(dados)) {
            for (let i = 0; i < dados.length; i++) {
                const item = dados[i]; // Acessa o objeto dentro de cada item
                
                if (item.name.toLowerCase() === pokemonName.toLowerCase()) {
                    resultado.push(item);
                    console.log('Pokemon encontrado: ', item);
                }
            }
        }
 
        console.log('Resultado: ', JSON.stringify(resultado));
        console.log('Pokemon encontrado: ' + resultado);
        
        if (!resultado) {
            return handlerInput.responseBuilder
                .speak(`Não foi encontrado nenhum Pokémon chamado ${name.value}.`)
                .getResponse();
        }
        const abilities = resultado[0].abilities.join(', '); 
        
        if (!abilities || abilities.length === 0) {
            return handlerInput.responseBuilder
                .speak(`O Pokémon ${name.value} não possui habilidades registradas.`)
                .getResponse();
        }
        
        // Gerar a resposta com as habilidades do Pokémon
        let speechOutput = `As habilidades do Pokémon ${name.value} são: ${abilities}.`;
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};

const ListarPokemonsPorNumeroIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListarPokemonsPorNumeroIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;

        // Atributos persistentes com os dados dos Pokémon
        const persistentAttributes = await attributesManager.getPersistentAttributes();

        if (!persistentAttributes || !Array.isArray(persistentAttributes) || persistentAttributes.length === 0) {
            return handlerInput.responseBuilder
                .speak('Não há dados de Pokémon armazenados.')
                .getResponse();
        }

        // Ordenar os Pokémon por número
        persistentAttributes.sort((a, b) => {
            return a.number - b.number;
        });

        // Gerar a resposta com os Pokémon em ordem numérica
        let speechOutput = 'Os Pokémon em ordem numérica são: ';
        persistentAttributes.forEach((pokemon, index) => {
            speechOutput += `${index + 1}. ${pokemon.name}, `;
        });

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};

const ExcluirTodosPokemonsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExcluirTodosPokemonsIntent';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        
        // Limpar todos os dados persistentes (todos os pokémons)
        attributesManager.setPersistentAttributes([]);
        attributesManager.savePersistentAttributes();
        
        return handlerInput.responseBuilder
            .speak('Todos os registros de Pokémon foram deletados.')
            .getResponse();
    }
};

const SortearPokemonIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SortearPokemonIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        
        // Obter os dados persistentes (pokémons)
        const dados = await attributesManager.getPersistentAttributes();
        
        if (!dados || dados.length === 0) {
            return handlerInput.responseBuilder
                .speak('Não há Pokémon cadastrados para sortear.')
                .getResponse();
        }
        
        // Sortear um Pokémon aleatoriamente
        const randomIndex = Math.floor(Math.random() * dados.length);
        const pokemon = dados[randomIndex];
        // Montar a resposta com os detalhes do Pokémon sorteado
        const pokemonName = pokemon.name;
        const pokemonType = pokemon.type.join(', ');
        const pokemonNumber = pokemon.number;
        const pokemonAbilities = pokemon.abilities.join(', ');
        const pokemonEvolution = pokemon.evolution;
                
        const speechOutput = `O Pokémon sorteado é ${pokemonName}, do tipo ${pokemonType}, número ${pokemonNumber}, com as habilidades ${pokemonAbilities}. A sua evolução é ${pokemonEvolution}.`;
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Você pode me pedir para cadastrar, listar ou buscar um Pokémon! Como posso ajudar?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Até logo!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Desculpe, não entendi. Tente novamente.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Você acionou o intent ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Desculpe, houve um problema ao processar seu pedido. Tente novamente.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CadastrarPokemonIntentHandler,
        ExcluirPokemonIntentHandler,
        ConsultarHabilidadesDoPokemonIntentHandler,
        BuscarPokemonPorTipoIntentHandler,
        BuscarPokemonPorNomeIntentHandler,
        AtualizarInformacoesDoPokemonIntentHandler,
        ConsultarEvolucoesDoPokemonIntentHandler,
        ListarPokemonsPorNumeroIntentHandler,
        ExcluirTodosPokemonsIntentHandler,
        SortearPokemonIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/pokedex/v1.0')
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )
    .lambda();
