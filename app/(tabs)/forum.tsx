import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAppAlert } from '@/components/app-alert';

type Filtro = 'postagens' | 'em-alta' | 'minhas';

type Comentario = {
  id: string;
  usuario: string;
  texto: string;
  tempo: string;
  curtidas: number;
  curtido: boolean;
};

type Postagem = {
  id: string;
  usuario: string;
  texto: string;
  tempo: string;
  curtidas: number;
  curtido: boolean;
  ehMinha: boolean;
  comentarios: Comentario[];
};

const POSTAGENS_INICIAIS: Postagem[] = [
  {
    id: '1',
    usuario: 'Anônima',
    texto: 'Hoje consegui dar o primeiro passo e procurei o CRAS da minha região. Me senti acolhida.',
    tempo: '2h',
    curtidas: 24,
    curtido: false,
    ehMinha: false,
    comentarios: [
      {
        id: '1-1',
        usuario: 'Clara M.',
        texto: 'Que bom que você encontrou acolhimento. Obrigada por compartilhar isso com a gente.',
        tempo: '1h',
        curtidas: 5,
        curtido: false,
      },
      {
        id: '1-2',
        usuario: 'Anônima',
        texto: 'Seu relato me deu coragem para procurar ajuda também.',
        tempo: '38min',
        curtidas: 8,
        curtido: false,
      },
    ],
  },
  {
    id: '2',
    usuario: 'Maria S.',
    texto: 'Alguém sabe me dizer se a medida protetiva demora muito para sair aqui em São Paulo?',
    tempo: '5h',
    curtidas: 18,
    curtido: false,
    ehMinha: false,
    comentarios: [
      {
        id: '2-1',
        usuario: 'Ana P.',
        texto: 'Procure a Delegacia da Mulher da sua região. Elas conseguem orientar todo o processo.',
        tempo: '4h',
        curtidas: 6,
        curtido: false,
      },
    ],
  },
  {
    id: '3',
    usuario: 'Anônima',
    texto: 'Passando para lembrar que pedir ajuda também é um ato de coragem. Vocês não estão sozinhas.',
    tempo: 'Ontem',
    curtidas: 41,
    curtido: false,
    ehMinha: false,
    comentarios: [],
  },
];

export default function ForumScreen() {
  const [postagens, setPostagens] = useState(POSTAGENS_INICIAIS);
  const [novoPost, setNovoPost] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('postagens');
  const [postagemAbertaId, setPostagemAbertaId] = useState<string | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  const postagemAberta = postagens.find((postagem) => postagem.id === postagemAbertaId) ?? null;

  const postagensVisiveis = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase('pt-BR');
    let resultado = termo
      ? postagens.filter((postagem) =>
          [postagem.texto, postagem.usuario].some((valor) =>
            valor.toLocaleLowerCase('pt-BR').includes(termo)
          )
        )
      : [...postagens];

    if (filtro === 'minhas') resultado = resultado.filter((postagem) => postagem.ehMinha);
    if (filtro === 'em-alta') {
      resultado.sort(
        (a, b) => b.curtidas + b.comentarios.length - (a.curtidas + a.comentarios.length)
      );
    }

    return resultado;
  }, [filtro, pesquisa, postagens]);

  const tituloLista =
    filtro === 'em-alta'
      ? 'Em alta agora'
      : filtro === 'minhas'
        ? 'Minhas postagens'
        : 'Postagens recentes';

  const publicar = () => {
    const texto = novoPost.trim();
    if (!texto) return;

    setPostagens((atuais) => [
      {
        id: `${Date.now()}`,
        usuario: 'Você',
        texto,
        tempo: 'Agora',
        curtidas: 0,
        curtido: false,
        ehMinha: true,
        comentarios: [],
      },
      ...atuais,
    ]);
    setNovoPost('');
    setFiltro('minhas');
  };

  const alternarCurtida = (id: string) => {
    setPostagens((atuais) =>
      atuais.map((postagem) =>
        postagem.id === id
          ? {
              ...postagem,
              curtido: !postagem.curtido,
              curtidas: postagem.curtidas + (postagem.curtido ? -1 : 1),
            }
          : postagem
      )
    );
  };

  const alternarCurtidaComentario = (postagemId: string, comentarioId: string) => {
    setPostagens((atuais) =>
      atuais.map((postagem) =>
        postagem.id === postagemId
          ? {
              ...postagem,
              comentarios: postagem.comentarios.map((comentario) =>
                comentario.id === comentarioId
                  ? {
                      ...comentario,
                      curtido: !comentario.curtido,
                      curtidas: comentario.curtidas + (comentario.curtido ? -1 : 1),
                    }
                  : comentario
              ),
            }
          : postagem
      )
    );
  };

  const comentar = () => {
    const texto = novoComentario.trim();
    if (!texto || !postagemAbertaId) return;

    setPostagens((atuais) =>
      atuais.map((postagem) =>
        postagem.id === postagemAbertaId
          ? {
              ...postagem,
              comentarios: [
                ...postagem.comentarios,
                {
                  id: `${Date.now()}`,
                  usuario: 'Você',
                  texto,
                  tempo: 'Agora',
                  curtidas: 0,
                  curtido: false,
                },
              ],
            }
          : postagem
      )
    );
    setNovoComentario('');
  };

  const abrirEdicao = (postagem: Postagem) => {
    setEditandoId(postagem.id);
    setTextoEdicao(postagem.texto);
  };

  const salvarEdicao = () => {
    const texto = textoEdicao.trim();
    if (!texto || !editandoId) return;

    setPostagens((atuais) =>
      atuais.map((postagem) =>
        postagem.id === editandoId && postagem.ehMinha
          ? { ...postagem, texto, tempo: 'Editada agora' }
          : postagem
      )
    );
    setEditandoId(null);
    setTextoEdicao('');
  };

  const excluirPostagem = (postagem: Postagem) => {
    showAppAlert(
      'Excluir postagem?',
      'A postagem e todos os comentários serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setPostagens((atuais) =>
              atuais.filter((item) => item.id !== postagem.id || !item.ehMinha)
            );
            if (postagemAbertaId === postagem.id) setPostagemAbertaId(null);
          },
        },
      ]
    );
  };

  const abrirMenu = (postagem: Postagem) => {
    if (!postagem.ehMinha) return;

    showAppAlert('Sua postagem', undefined, [
      { text: 'Editar', onPress: () => abrirEdicao(postagem) },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirPostagem(postagem) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const abrirComentarios = (postagemId: string) => {
    setNovoComentario('');
    setPostagemAbertaId(postagemId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <FlatList
          data={postagensVisiveis}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.headingRow}>
                <View style={styles.logoCircle}>
                  <Ionicons name="people" size={25} color="#FFFFFF" />
                </View>
                <View style={styles.headingText}>
                  <Text style={styles.title}>Fórum</Text>
                  <Text style={styles.subtitle}>Um espaço seguro para conversar e acolher.</Text>
                </View>
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={22} color="#8E7D84" />
                <TextInput
                  value={pesquisa}
                  onChangeText={setPesquisa}
                  placeholder="Buscar no fórum"
                  placeholderTextColor="#9B8D92"
                  returnKeyType="search"
                  style={styles.searchInput}
                />
                {pesquisa.length > 0 && (
                  <TouchableOpacity accessibilityLabel="Limpar pesquisa" onPress={() => setPesquisa('')}>
                    <Ionicons name="close-circle" size={20} color="#AFA1A6" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
              >
                <FilterButton
                  active={filtro === 'postagens'}
                  label="Postagens"
                  onPress={() => setFiltro('postagens')}
                />
                <FilterButton
                  active={filtro === 'em-alta'}
                  label="Em alta"
                  onPress={() => setFiltro('em-alta')}
                />
                <FilterButton
                  active={filtro === 'minhas'}
                  label="Minhas postagens"
                  onPress={() => setFiltro('minhas')}
                />
              </ScrollView>

              <View style={styles.composer}>
                <Avatar minha size="small" />
                <TextInput
                  value={novoPost}
                  onChangeText={setNovoPost}
                  placeholder="Compartilhe algo com a comunidade..."
                  placeholderTextColor="#93858A"
                  multiline
                  maxLength={500}
                  style={styles.composerInput}
                />
                <TouchableOpacity
                  accessibilityLabel="Publicar"
                  disabled={!novoPost.trim()}
                  onPress={publicar}
                  style={[styles.publishButton, !novoPost.trim() && styles.publishButtonDisabled]}
                >
                  <Ionicons name="arrow-up" size={21} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{tituloLista}</Text>
                <Text style={styles.resultCount}>{postagensVisiveis.length}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={filtro === 'minhas' ? 'create-outline' : 'search-outline'}
                size={34}
                color="#BCAEB3"
              />
              <Text style={styles.emptyTitle}>
                {filtro === 'minhas' ? 'Você ainda não publicou' : 'Nenhuma postagem encontrada'}
              </Text>
              <Text style={styles.emptyText}>
                {filtro === 'minhas'
                  ? 'Sua próxima postagem aparecerá aqui.'
                  : 'Tente buscar por outra palavra.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              postagem={item}
              onCurtir={() => alternarCurtida(item.id)}
              onComentar={() => abrirComentarios(item.id)}
              onMenu={() => abrirMenu(item)}
            />
          )}
        />
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        visible={postagemAberta !== null}
        onRequestClose={() => setPostagemAbertaId(null)}
      >
        <SafeAreaView style={styles.threadSafeArea}>
          {postagemAberta && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.threadContainer}
            >
              <View style={styles.threadHeader}>
                <TouchableOpacity
                  accessibilityLabel="Voltar ao fórum"
                  onPress={() => setPostagemAbertaId(null)}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#3B1421" />
                </TouchableOpacity>
                <Text style={styles.threadTitle}>Postagem</Text>
                <View style={styles.headerSpacer} />
              </View>

              <FlatList
                data={postagemAberta.comentarios}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.commentsContent}
                ListHeaderComponent={
                  <View style={styles.threadPost}>
                    <View style={styles.postHeader}>
                      <View style={styles.authorRow}>
                        <Avatar minha={postagemAberta.ehMinha} />
                        <View>
                          <Text style={styles.authorName}>{postagemAberta.usuario}</Text>
                          <Text style={styles.postTime}>{postagemAberta.tempo}</Text>
                        </View>
                      </View>
                      {postagemAberta.ehMinha && (
                        <TouchableOpacity onPress={() => abrirMenu(postagemAberta)}>
                          <Ionicons name="ellipsis-horizontal" size={22} color="#9A898F" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.threadPostText}>{postagemAberta.texto}</Text>
                    <View style={styles.threadActions}>
                      <TouchableOpacity
                        onPress={() => alternarCurtida(postagemAberta.id)}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name={postagemAberta.curtido ? 'heart' : 'heart-outline'}
                          size={22}
                          color={postagemAberta.curtido ? '#D43E67' : '#751935'}
                        />
                        <Text style={[styles.actionText, postagemAberta.curtido && styles.likedText]}>
                          {postagemAberta.curtidas}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={20} color="#751935" />
                        <Text style={styles.actionText}>{postagemAberta.comentarios.length}</Text>
                      </View>
                    </View>
                    <Text style={styles.repliesTitle}>Respostas</Text>
                  </View>
                }
                ListEmptyComponent={
                  <View style={styles.noComments}>
                    <Text style={styles.emptyTitle}>Ainda não há comentários</Text>
                    <Text style={styles.emptyText}>Seja a primeira pessoa a responder.</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.commentRow}>
                    <Avatar minha={item.usuario === 'Você'} size="small" />
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentAuthor}>{item.usuario}</Text>
                        <Text style={styles.commentTime}>· {item.tempo}</Text>
                      </View>
                      <Text style={styles.commentText}>{item.texto}</Text>
                      <TouchableOpacity
                        onPress={() => alternarCurtidaComentario(postagemAberta.id, item.id)}
                        style={styles.commentLike}
                      >
                        <Ionicons
                          name={item.curtido ? 'heart' : 'heart-outline'}
                          size={17}
                          color={item.curtido ? '#D43E67' : '#8F7D83'}
                        />
                        {item.curtidas > 0 && (
                          <Text style={[styles.commentLikeText, item.curtido && styles.likedText]}>
                            {item.curtidas}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <View style={styles.replyComposer}>
                <Avatar minha size="small" />
                <TextInput
                  value={novoComentario}
                  onChangeText={setNovoComentario}
                  placeholder={`Responder a ${postagemAberta.usuario}`}
                  placeholderTextColor="#94848A"
                  multiline
                  maxLength={500}
                  style={styles.replyInput}
                />
                <TouchableOpacity
                  accessibilityLabel="Enviar comentário"
                  disabled={!novoComentario.trim()}
                  onPress={comentar}
                  style={[styles.replyButton, !novoComentario.trim() && styles.replyButtonDisabled]}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={editandoId !== null}
        onRequestClose={() => setEditandoId(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editOverlay}
        >
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Editar postagem</Text>
            <TextInput
              autoFocus
              value={textoEdicao}
              onChangeText={setTextoEdicao}
              multiline
              maxLength={500}
              style={styles.editInput}
            />
            <Text style={styles.characterCount}>{textoEdicao.length}/500</Text>
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditandoId(null)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!textoEdicao.trim()}
                onPress={salvarEdicao}
                style={[styles.saveButton, !textoEdicao.trim() && styles.publishButtonDisabled]}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function FilterButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterButton, active && styles.filterButtonActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Avatar({ minha, size = 'normal' }: { minha: boolean; size?: 'small' | 'normal' }) {
  return (
    <View style={[styles.avatar, size === 'small' && styles.avatarSmall]}>
      <Ionicons
        name={minha ? 'person' : 'person-outline'}
        size={size === 'small' ? 19 : 22}
        color="#751935"
      />
    </View>
  );
}

function PostCard({
  postagem,
  onCurtir,
  onComentar,
  onMenu,
}: {
  postagem: Postagem;
  onCurtir: () => void;
  onComentar: () => void;
  onMenu: () => void;
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorRow}>
          <Avatar minha={postagem.ehMinha} />
          <View>
            <Text style={styles.authorName}>{postagem.usuario}</Text>
            <Text style={styles.postTime}>{postagem.tempo}</Text>
          </View>
        </View>
        {postagem.ehMinha && (
          <TouchableOpacity accessibilityLabel="Editar ou excluir postagem" onPress={onMenu}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#9A898F" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.postText}>{postagem.texto}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityLabel={postagem.curtido ? 'Remover curtida' : 'Curtir postagem'}
          onPress={onCurtir}
          style={styles.actionButton}
        >
          <Ionicons
            name={postagem.curtido ? 'heart' : 'heart-outline'}
            size={23}
            color={postagem.curtido ? '#D43E67' : '#751935'}
          />
          <Text style={[styles.actionText, postagem.curtido && styles.likedText]}>
            {postagem.curtidas}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Abrir comentários" onPress={onComentar} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={21} color="#751935" />
          <Text style={styles.actionText}>{postagem.comentarios.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDF8FA' },
  container: { flex: 1, backgroundColor: '#FDF8FA' },
  listContent: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 115 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#751935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: { flex: 1, marginLeft: 13 },
  title: { color: '#3B1421', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#826F76', fontSize: 12, lineHeight: 17, marginTop: 2 },
  searchBox: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#F0EAEC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { flex: 1, height: '100%', marginLeft: 10, color: '#3B1421', fontSize: 15 },
  filters: { gap: 9, paddingTop: 14, paddingBottom: 18 },
  filterButton: {
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F2EDEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  filterButtonActive: { backgroundColor: '#C74B6E' },
  filterText: { color: '#751935', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  composer: {
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E2E7',
    shadowColor: '#5B0E2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingTop: 12,
    color: '#3B1421',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  publishButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#751935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonDisabled: { backgroundColor: '#CCBEC3' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 12 },
  sectionTitle: { color: '#3B1421', fontSize: 18, fontWeight: '800' },
  resultCount: {
    color: '#9B3353',
    backgroundColor: '#F5E1E8',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#F1E5E9',
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F8E5EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarSmall: { width: 38, height: 38, borderRadius: 19 },
  authorName: { color: '#3B1421', fontSize: 14, fontWeight: '700' },
  postTime: { color: '#9D8D92', fontSize: 12, marginTop: 2 },
  postText: { color: '#30272A', fontSize: 15, lineHeight: 22, marginTop: 15 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    borderTopWidth: 1,
    borderTopColor: '#F2E8EB',
    marginTop: 16,
    paddingTop: 13,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 3 },
  actionText: { color: '#735E65', fontSize: 13, fontWeight: '600' },
  likedText: { color: '#D43E67' },
  emptyState: { alignItems: 'center', paddingVertical: 45 },
  emptyTitle: { color: '#5A414A', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#9A898F', fontSize: 13, marginTop: 4 },
  threadSafeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  threadContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  threadHeader: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE5E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  backButton: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  threadTitle: { color: '#3B1421', fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 42 },
  commentsContent: { paddingBottom: 24 },
  threadPost: { paddingHorizontal: 20, paddingTop: 18 },
  threadPostText: { color: '#292124', fontSize: 18, lineHeight: 26, marginTop: 18 },
  threadActions: {
    flexDirection: 'row',
    gap: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EFE5E8',
    marginTop: 18,
    paddingVertical: 12,
  },
  repliesTitle: { color: '#3B1421', fontSize: 16, fontWeight: '800', marginTop: 18 },
  noComments: { alignItems: 'center', paddingVertical: 35 },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EAED',
  },
  commentBody: { flex: 1 },
  commentMeta: { flexDirection: 'row', alignItems: 'center' },
  commentAuthor: { color: '#3B1421', fontSize: 14, fontWeight: '700' },
  commentTime: { color: '#97868C', fontSize: 12, marginLeft: 4 },
  commentText: { color: '#332A2D', fontSize: 14, lineHeight: 20, marginTop: 5 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, alignSelf: 'flex-start' },
  commentLikeText: { color: '#8F7D83', fontSize: 12 },
  replyComposer: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EADDE1',
    backgroundColor: '#FFFFFF',
  },
  replyInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 90,
    borderRadius: 21,
    backgroundColor: '#F4EFF1',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 11 : 9,
    color: '#3B1421',
    fontSize: 14,
  },
  replyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#751935',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  replyButtonDisabled: { backgroundColor: '#CFC2C6' },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 10, 17, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  editCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 },
  editTitle: { color: '#3B1421', fontSize: 19, fontWeight: '800', marginBottom: 14 },
  editInput: {
    minHeight: 130,
    maxHeight: 230,
    backgroundColor: '#F7F1F3',
    borderRadius: 16,
    padding: 14,
    color: '#30272A',
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  characterCount: { color: '#99898E', fontSize: 11, textAlign: 'right', marginTop: 6 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 11 },
  cancelButtonText: { color: '#735E65', fontSize: 14, fontWeight: '600' },
  saveButton: { backgroundColor: '#751935', borderRadius: 13, paddingHorizontal: 21, paddingVertical: 11 },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
