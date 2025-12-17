# Configuração do Projeto SST MVP

## 1. Supabase Setup
1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Vá para o **SQL Editor** no painel do Supabase.
3. Copie o conteúdo do arquivo `schema.sql` deste projeto e execute-o. Isso criará todas as tabelas necessárias.
4. Vá para **Project Settings > API**.
5. Copie a `URL` e a `anon` key.

## 2. Configuração de Ambiente
1. Renomeie o arquivo `.env.example` para `.env.local` (ou crie um novo `.env.local`).
2. Adicione suas chaves do Supabase:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key-aqui
   ```

## 3. Rodar o Projeto
1. Instale as dependências (já estao instaladas, mas se precisar):
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000`.

## Estrutura
- `src/app`: Páginas e Rotas (Next.js App Router).
- `src/lib/supabase.ts`: Cliente de conexão com banco.
- `src/components`: Componentes reutilizáveis (a criar).
- `schema.sql`: Estrutura do Banco de Dados.
