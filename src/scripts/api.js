const apiURL = "https://pokeapi.co/api/v2/pokemon/";
const genAPI = "https://pokeapi.co/api/v2/generation/";

export async function fetchPokemon(idOrName) {
    try {
        const response = await fetch(`${apiURL}${idOrName}`);
        if (!response.ok) throw new Error(`Pokémon not found: ${idOrName}`);

        const data = await response.json();
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);
        const speciesData = await speciesResponse.json();

        return {
            name: data.name,
            type: data.types.map(t => t.type.name),
            color: speciesData.color.name,
            sprite: data.sprites.front_default,
            evolutionStage: getEvolutionStage(speciesData),
            gen: speciesData.generation.name
        };
    } catch (error) {
        console.error(`Error fetching Pokémon ${idOrName}:`, error);
        throw error;
    }
}

function getEvolutionStage(speciesData) {
    if (speciesData.evolves_from_species === null) {
        return "Basic";
    }
    return "Stage 1+";
}

export async function fetchPokedexByGeneration(genNumber) {
    try {
        const response = await fetch(`${genAPI}${genNumber}`);
        if (!response.ok) throw new Error(`Generation not found: ${genNumber}`);

        const data = await response.json();

        console.log(`Generation ${genNumber} Pokémon species:`, data.pokemon_species);

        const pokedexData = await Promise.all(
            data.pokemon_species.map(async (species) => {
                try {
                    console.log(`Fetching Pokémon: ${species.name}`);
                    const pokemon = await fetchPokemon(species.name);
                    return {
                        name: pokemon.name,
                        sprite: pokemon.sprite
                    };
                } catch (error) {
                    console.error(`Error fetching Pokémon ${species.name}:`, error);
                    return null;
                }
            })
        );

        return pokedexData.filter(pokemon => pokemon !== null);

    } catch (error) {
        console.error(`Error fetching generation ${genNumber}:`, error);
        throw error;
    }
}
