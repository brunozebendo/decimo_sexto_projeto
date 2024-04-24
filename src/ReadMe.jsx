/**esse é o código da seção 16 que vai ensinar custom hooks,
 * para isso está sendo reutilizado o código da última seção, com as mesmas
 * instalações já explicadas para rodar o site e o banco de dados em node.js
 */
/**lembrando duas regras dos hooks, só pode ser chamado dentro de componentes
 * funcionais e tem que ser chamado no começo da função (top level). Mas a primeira
 * regra vai ser um pouco modificada para que o Hook também possa ser chamado dentro de outro 
 * hook. A ideia geral é q um custom hook é como uma função q possa ser chamada
 * de qualquer lugar do código, pois a função normal q de tem um state dentro, por
 * exemplo, fica restrita ao escopo daquele componente.
 */
/**Na aula 243 é criado um custom hook, primeiro é criada uma pasta (hooks), o que não
 * é obrigatório, e criado um componente useFetch.js, dentro do componente é criada
 * a função abaixo que tem que começar com o use para que o React reconheça que é
 * uma função hook. Dentro da função, é copiada a função que estava no APP e lá é
 * só chamada a função, conforme copio abaixo.
 * Na aula 244 é incluída a lógica para controle de estado dentro do próprio Hook,
 * de uma forma mais genérica, já que essa é a intenção dos custom hooks, ser
 * o mais reaproveitável possível. Assim, são criados os 3 estados básicos, se está
 * buscando os dados, se deu erro e se os dados foram alcançados. Também foi criada
 * a função fecthFn no lugar de fetchUserPlaces, ou seja, uma função mais genérica
 * no lugar de uma que era usada para alcançar os locais escolhidos pelo usuário, 
 * essa função tem que ser passada como atributo e dependência no final da função [],
 * pois é uma informação externa que se modificado, deve renderizar novamente o 
 * componente, os locais onde aparecia o nome places foram mudados para data.
 * Já para tornar os valores iniciais disponíveis para o componente que os usará
 * posteriormente, eles são setados no return
 * Na aula 245 é incluída a lógica para passar o controle de estado para o 
 * componente recebedor, no caso, o App.js, lá estão as funções
 * para selecionar e deletar o card, ou seja, mudar o estado deles,
 * então, para isso continuar sendo feito por lá, no return, foi incluído o setFetchedData.
*/

import { useEffect, useState } from "react";

export function useFetch (fetchFn, initialValue) {
  const [isFetching, setIsFetching] = useState();
  const [error, setError] = useState();
  const [fetchedData, setFetchedData] = useState(initialValue);

    useEffect(() => {
        async function fetchData() {
          setIsFetching(true);
          try {
            const data = await fetchFn();
            setFetchedData(data);
          } catch (error) {
            setError({ message: error.message || 'Failed to fetch data.' });
          }
    
          setIsFetching(false);
        }
    
        fetchData();
      }, [fetchFn]);

      return {
        isFetching,
        fetchedData,
        setFetchedData,
        error
      }
}


/**No App.jsx, no lugar onde toda a função acima estava copiada, fica assim,
 * com os estados iniciais (o userPlaces sendo usado com um alias (apelido)), a função que efetivamente busca os dados no http e um
 * array vazio para quando ainda não houver dados iniciais. Se houver alguma
 * atualização de estado no custom hook, o componente que o está utilizando também
 * será executado novamente. Na aula 245, o setFetchedData foi recepcionado e usado
 * um alias para manter o nome que já vinha sendo usado (um bom método para
 * evitar ficar mudando o nome de tudo). O estado vai ser único para cada componente
 * que usar o custom hook.
*/

const { isFetching,
    error,
    fetchedData: userPlaces,
    setFetchedData: setUserPlaces} = useFetch(fetchUserPlaces, []);

/**Aula 246 e 247 atualizam o componente AvailablePlace que cuida da lógica para
 * exibir todos os locais diponíveis tendo uma lógica parecida com o do useFetch o que,
 * afinal, é a intenção do custom hook, poder substituir a lógica e deixar o componente
 * mais leaning (limpo/simples), para comparar, tem que olhar no projeto anterior.
 */
/**primeiro é preciso importar o componente useFetch */
import Places from './Places.jsx';
import Error from './Error.jsx';
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';
import { useFetch } from '../hooks/useFetch.js';

/**esta função que serve para organizar os locais por distância de acordo com a localização
 * do usuário, teve que ser adaptada já que não tem mais o controle de estado, assim
 * ela foi setada como uma função assíncrona, a variável places vai guardar o resultado
 * da função fetchSortedPlaces que foi acima importada e é a que obtem todos
 * os locais, então o return cria uma nova Promise (sujo conceito copiei no material) 
 * mas que é uma função nativa do JS que espera o resultado daquela função
 * e trabalha com o resultado (resolve e reject), no caso, o resolve vai retornar
 * os locais já organizados por distância do usuário   */
async function fetchSortedPlaces(){
  const places = await fetchAvailablePlaces();
  
  return new Promise ((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude
      );

      resolve (sortedPlaces);
    });
  });  
}

/**já aqui é a função que deixou de ter toda lógica de handles, que ficou com o
 * custom hook, e usando destructuring, apenas importou os estados abaixo, 
 * setando alguns como alias para já aproveitar o nome anteriormente dado 
 */
export default function AvailablePlaces({ onSelectPlace }) {
  const {isFetching,
     error,
     fetchedData: availablePlaces,
     setFetchedData: setAvailablesPlaces
     } = useFetch(fetchSortedPlaces, []);

    if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
