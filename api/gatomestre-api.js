// Função serverless para fazer proxy da API do Gato Mestre (Vercel)
// Resolve o problema de CORS ao fazer a requisição no servidor

export default async function handler(req, res) {
    // Apenas aceitar requisições GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Obter o token de autorização dos headers
    const authToken = req.headers.authorization || req.headers.Authorization;
    
    if (!authToken) {
        return res.status(401).json({ error: 'Token de autorização não fornecido' });
    }

    try {
        // Fazer requisição para a API do Gato Mestre
        const response = await fetch('https://api.cartola.globo.com/auth/gatomestre/atletas', {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Erro na API do Gato Mestre: ${response.status}`,
                message: response.status === 401 ? 'Token inválido ou expirado' : 'Erro ao buscar dados'
            });
        }

        const data = await response.json();

        // Configurar headers CORS
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar dados do Gato Mestre:', error);
        return res.status(500).json({ 
            error: 'Erro interno ao buscar dados',
            details: error.message 
        });
    }
}
