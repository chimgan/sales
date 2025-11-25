import { ChangeEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Switch,
  FormControl,
  OutlinedInput,
  Select,
  Chip,
  CircularProgress,
  Alert,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  QuerySnapshot,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Unsubscribe,
  FirestoreError,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Item, Category, Tag, Currency, Inquiry, InquiryMessage, ItemStatus } from '../types';
import { getMersinDistricts } from '../data/locations';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';
import { formatPrice } from '../utils/currency';

type FormState = {
  title: string;
  description: string;
  price: string;
  discountPrice: string;
  currency: Currency;
  category: string;
  tags: string[];
  location: string;
  district: string;
  useDropdown: boolean;
};

type InputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const MyAdvertisementsPage = () => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [tabValue, setTabValue] = useState<'listings' | 'conversations'>('listings');
  const [conversations, setConversations] = useState<Inquiry[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const conversationBuckets = useRef<{ owner: Inquiry[]; user: Inquiry[] }>({ owner: [], user: [] });
  const conversationUnsubs = useRef<Unsubscribe[]>([]);
  const messagesUnsub = useRef<Unsubscribe | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [conversationActionLoading, setConversationActionLoading] = useState(false);

  const defaultFormState: FormState = {
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    currency: 'USD' as Currency,
    category: '',
    tags: [] as string[],
    location: '',
    district: '',
    useDropdown: true,
  };

  const [formData, setFormData] = useState<FormState>({ ...defaultFormState });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const mersinDistricts = getMersinDistricts();
  const currentUserId = user?.uid ?? '';
  const unreadConversationCount = useMemo(
    () => conversations.filter((conversation) => conversation.unreadFor?.includes(currentUserId)).length,
    [conversations, currentUserId]
  );
  const conversationsTabLabel = unreadConversationCount
    ? `${t.myAds.conversationsTab} (${unreadConversationCount})`
    : t.myAds.conversationsTab;

  const resolveStatusLabel = (status: ItemStatus = 'on_sale') => {
    switch (status) {
      case 'sold':
        return t.status.sold;
      case 'reserved':
        return t.status.reserved;
      default:
        return t.status.onSale;
    }
  };

  const handleUpdateItemStatus = async (itemId: string, nextStatus: ItemStatus) => {
    try {
      setStatusUpdatingId(itemId);
      await updateDoc(doc(db, 'items', itemId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      await fetchUserItems();
      enqueueSnackbar(
        nextStatus === 'sold' ? t.myAds.markAsSoldSuccess : t.myAds.markAsAvailableSuccess,
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error updating item status:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const resolveStatusColor = (status: ItemStatus = 'on_sale') => {
    switch (status) {
      case 'sold':
        return 'error';
      case 'reserved':
        return 'warning';
      default:
        return 'success';
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchCategories(), fetchTags(), fetchDailyLimit(), fetchUserItems()]);
      } catch (error) {
        console.error('Error initializing my ads page:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(
      snap.docs.map((categoryDoc: QueryDocumentSnapshot<DocumentData>) => ({
        id: categoryDoc.id,
        ...(categoryDoc.data() as Omit<Category, 'id'>),
      }))
    );
  };

  const fetchTags = async () => {
    const snap = await getDocs(collection(db, 'tags'));
    setTags(
      snap.docs.map((tagDoc: QueryDocumentSnapshot<DocumentData>) => ({
        id: tagDoc.id,
        ...(tagDoc.data() as Omit<Tag, 'id'>),
      }))
    );
  };

  const fetchDailyLimit = async () => {
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      if (typeof data.dailyUserAdLimit === 'number') {
        setDailyLimit(data.dailyUserAdLimit);
      }
    }
  };

  const fetchUserItems = async () => {
    if (!user) return;

    const itemsQuery = query(collection(db, 'items'), where('createdBy', '==', user.uid));

    const snap = await getDocs(itemsQuery);
    const mapped = snap.docs.map((itemDoc: QueryDocumentSnapshot<DocumentData>) => {
      const data = itemDoc.data();
      const createdAt = data.createdAt?.toDate?.() ?? new Date();
      const updatedAt = data.updatedAt?.toDate?.() ?? new Date();
      return {
        id: itemDoc.id,
        ...data,
        createdAt,
        updatedAt,
      } as Item;
    });

    const sorted = mapped.sort((a: Item, b: Item) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    setUserItems(sorted);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    setTodayCount(
      sorted.filter((item: Item) => item.createdAt && item.createdAt >= startOfDay).length
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(Array.from(event.target.files));
    }
  };

  const resetForm = () => {
    setFormData({ ...defaultFormState });
    setImageFiles([]);
  };

  const getConversationTimeValue = (conversation: Inquiry) =>
    conversation.lastMessageAt?.getTime?.() ??
    conversation.updatedAt?.getTime?.() ??
    conversation.createdAt?.getTime?.() ??
    0;

  const mergeConversationBuckets = () => {
    const byId = new Map<string, Inquiry>();

    const pushItems = (items: Inquiry[]) => {
      items.forEach((conversation: Inquiry) => {
        const existing = byId.get(conversation.id);
        if (!existing) {
          byId.set(conversation.id, conversation);
          return;
        }

        if (getConversationTimeValue(conversation) > getConversationTimeValue(existing)) {
          byId.set(conversation.id, conversation);
        }
      });
    };

    pushItems(conversationBuckets.current.owner);
    pushItems(conversationBuckets.current.user);

    const merged = Array.from(byId.values()).sort(
      (a: Inquiry, b: Inquiry) => getConversationTimeValue(b) - getConversationTimeValue(a)
    );

    const visible = merged.filter((conversation) => !conversation.hiddenFor?.includes(currentUserId));

    setConversations(visible);
    setConversationsLoading(false);
  };

  useEffect(() => {
    conversationUnsubs.current.forEach((unsub: Unsubscribe) => unsub());
    conversationUnsubs.current = [];
    messagesUnsub.current?.();
    messagesUnsub.current = null;
    conversationBuckets.current = { owner: [], user: [] };
    setConversations([]);
    setMessages([]);

    if (!user) {
      setConversationsLoading(false);
      return () => {};
    }

    setConversationsLoading(true);

    const ownerQuery = query(collection(db, 'inquiries'), where('ownerId', '==', user.uid));
    const userQuery = query(collection(db, 'inquiries'), where('userId', '==', user.uid));

    const subscribe = (bucketKey: 'owner' | 'user', q: Query<DocumentData>) =>
      onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const data = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
            const docData = docSnap.data();
            return {
              id: docSnap.id,
              ...(docData as Omit<Inquiry, 'id'>),
              createdAt: docData.createdAt?.toDate?.() ?? new Date(),
              updatedAt: docData.updatedAt?.toDate?.() ?? new Date(),
              lastMessageAt: docData.lastMessageAt?.toDate?.(),
              hiddenFor: docData.hiddenFor || [],
              unreadFor: docData.unreadFor || [],
              participants: docData.participants || [],
            } as Inquiry;
          });
          conversationBuckets.current[bucketKey] = data;
          mergeConversationBuckets();
        },
        (error: FirestoreError) => {
          console.error('Error loading conversations:', error);
          setConversationsLoading(false);
        }
      );

    const ownerUnsub = subscribe('owner', ownerQuery);
    const userUnsub = subscribe('user', userQuery);
    conversationUnsubs.current = [ownerUnsub, userUnsub];

    return () => {
      conversationUnsubs.current.forEach((unsub: Unsubscribe) => unsub());
      conversationUnsubs.current = [];
    };
  }, [user]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    } else if (conversations.length === 0) {
      setSelectedConversationId(null);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messagesUnsub.current?.();
    setMessages([]);

    if (!selectedConversationId) {
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);
    const messagesQuery = query(
      collection(db, 'inquiries', selectedConversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    messagesUnsub.current = onSnapshot(
      messagesQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const mapped = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          } as InquiryMessage;
        });
        setMessages(mapped);
        setMessagesLoading(false);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      (error: FirestoreError) => {
        console.error('Error loading messages:', error);
        setMessagesLoading(false);
      }
    );

    return () => {
      messagesUnsub.current?.();
      messagesUnsub.current = null;
    };
  }, [selectedConversationId]);

  const handleTabChange = (_event: SyntheticEvent, newValue: 'listings' | 'conversations') => {
    setTabValue(newValue);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessageInput('');
  };

  const handleSendMessage = async (event?: SyntheticEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!selectedConversationId) {
      return;
    }

    if (!user) {
      enqueueSnackbar(t.itemDetail.signInToInquire, { variant: 'info' });
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed) {
      enqueueSnackbar(t.myAds.messageEmptyWarning, { variant: 'warning' });
      return;
    }

    try {
      setSendingMessage(true);
      await addDoc(collection(db, 'inquiries', selectedConversationId, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        text: trimmed,
        createdAt: serverTimestamp(),
      });

      const otherParticipantIds =
        selectedConversation?.participants?.filter(
          (participantId): participantId is string => Boolean(participantId) && participantId !== currentUserId
        ) || [];

      const updatePayload: Record<string, unknown> = {
        lastMessageText: trimmed,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'contacted',
      };

      if (otherParticipantIds.length > 0) {
        updatePayload.unreadFor = arrayUnion(...otherParticipantIds);
      }

      await updateDoc(doc(db, 'inquiries', selectedConversationId), updatePayload);

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  const getConversationTimestamp = (conversation: Inquiry) => {
    const date = conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt;
    return date ? date.toLocaleString() : '';
  };

  const getConversationPartnerInfo = (conversation: Inquiry) => {
    const isOwner = conversation.ownerId === user?.uid;
    return {
      label: isOwner ? t.myAds.customerLabel : t.myAds.ownerLabel,
      name: isOwner ? conversation.userName : conversation.ownerName || 'Admin',
    };
  };

  const getConversationPreview = (conversation: Inquiry) =>
    conversation.lastMessageText || conversation.comment || '';

  const markConversationAsRead = async (conversationId: string) => {
    if (!currentUserId) return;
    try {
      await updateDoc(doc(db, 'inquiries', conversationId), {
        unreadFor: arrayRemove(currentUserId),
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleHideConversation = async (conversationId: string) => {
    if (!currentUserId) return;
    try {
      setConversationActionLoading(true);
      await updateDoc(doc(db, 'inquiries', conversationId), {
        hiddenFor: arrayUnion(currentUserId),
      });
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      enqueueSnackbar(t.myAds.conversationHidden, { variant: 'success' });
    } catch (error) {
      console.error('Error hiding conversation:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setConversationActionLoading(false);
    }
  };

  const selectedConversation = useMemo(
    () => conversations.find((conversation: Inquiry) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;
    if (selectedConversation.unreadFor?.includes(currentUserId)) {
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation, currentUserId]);

  const handleSubmit = async () => {
    if (!user) return;

    if (isPostingBlocked) {
      enqueueSnackbar(t.myAds.postingBlockedMessage, { variant: 'warning' });
      return;
    }

    if (!formData.title || !formData.price || !formData.category) {
      enqueueSnackbar(t.myAds.formRequired, { variant: 'warning' });
      return;
    }

    if (formData.useDropdown && !formData.district) {
      enqueueSnackbar(t.myAds.formRequired, { variant: 'warning' });
      return;
    }

    if (!formData.useDropdown && !formData.location.trim()) {
      enqueueSnackbar(t.myAds.formRequired, { variant: 'warning' });
      return;
    }

    if (dailyLimit !== null && todayCount >= dailyLimit) {
      enqueueSnackbar(t.myAds.limitReached, { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        imageUrls = await uploadMultipleToCloudinary(imageFiles);
      }

      const locationStr = formData.useDropdown
        ? `Mersin${formData.district ? ` - ${formData.district}` : ''}`
        : formData.location;

      const now = new Date();

      const priceValue = parseFloat(formData.price);
      if (Number.isNaN(priceValue)) {
        enqueueSnackbar(t.myAds.formRequired, { variant: 'warning' });
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        price: priceValue,
        currency: formData.currency,
        category: formData.category,
        tags: formData.tags,
        status: 'on_sale',
        images: imageUrls,
        location: locationStr.trim(),
        views: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        creatorName: user.displayName || user.email || 'User',
      };

      if (formData.discountPrice) {
        const discountValue = parseFloat(formData.discountPrice);
        if (!Number.isNaN(discountValue)) {
          payload.discountPrice = discountValue;
        }
      }

      await addDoc(collection(db, 'items'), payload);

      enqueueSnackbar(t.myAds.saveSuccess, { variant: 'success' });
      resetForm();
      await fetchUserItems();
    } catch (error) {
      console.error('Error creating advertisement:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t.myAds.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t.itemDetail.signInToInquire}
        </Typography>
        <Button variant="contained" size="large" onClick={signInWithGoogle}>
          {t.auth.continueWithGoogle}
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const limitInfoText = dailyLimit !== null ? t.myAds.limitInfo.replace('{limit}', String(dailyLimit)) : null;
  const usageText =
    dailyLimit !== null
      ? t.myAds.dailyUsage.replace('{count}', String(todayCount)).replace('{limit}', String(dailyLimit))
      : null;
  const isLimitReached = dailyLimit !== null && todayCount >= dailyLimit;
  const isPostingBlocked = Boolean(userProfile?.blockedFromPosting);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t.myAds.title}
      </Typography>

      {isPostingBlocked && tabValue === 'listings' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t.myAds.postingBlockedMessage}
        </Alert>
      )}

      {limitInfoText && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">{limitInfoText}</Typography>
          {usageText && (
            <Typography variant="body2" color="text.secondary">
              {usageText}
            </Typography>
          )}
        </Box>
      )}

      {isLimitReached && tabValue === 'listings' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t.myAds.limitReached}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={t.myAds.listingsTab} value="listings" />
        <Tab label={conversationsTabLabel} value="conversations" />
      </Tabs>

      {tabValue === 'listings' ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t.myAds.createButton}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label={`${t.admin.title} ${t.admin.required}`}
                      fullWidth
                      value={formData.title}
                      onChange={(e: InputChangeEvent) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={t.admin.description}
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e: InputChangeEvent) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`${t.admin.price} ${t.admin.required}`}
                      fullWidth
                      type="number"
                      value={formData.price}
                      onChange={(e: InputChangeEvent) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t.admin.discountPrice}
                      fullWidth
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e: InputChangeEvent) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`${t.admin.currency} ${t.admin.required}`}
                      fullWidth
                      select
                      value={formData.currency}
                      onChange={(e: SelectChangeEvent<string>) =>
                        setFormData({ ...formData, currency: e.target.value as Currency })
                      }
                    >
                      <MenuItem value="TRY">{t.currency.TRY}</MenuItem>
                      <MenuItem value="USD">{t.currency.USD}</MenuItem>
                      <MenuItem value="EUR">{t.currency.EUR}</MenuItem>
                      <MenuItem value="RUB">{t.currency.RUB}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`${t.admin.category} ${t.admin.required}`}
                      fullWidth
                      select
                      value={formData.category}
                      onChange={(e: SelectChangeEvent<string>) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {categories.map((category: Category) => (
                        <MenuItem key={category.id} value={category.slug}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="tags-label">{t.admin.tags}</InputLabel>
                      <Select
                        labelId="tags-label"
                        multiple
                        value={formData.tags}
                        onChange={(e: SelectChangeEvent<string[]>) =>
                          setFormData({ ...formData, tags: e.target.value as string[] })
                        }
                        input={<OutlinedInput label={t.admin.tags} />}
                        renderValue={(selected: string[]) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {tags.map((tag: Tag) => (
                          <MenuItem key={tag.id} value={tag.slug}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.useDropdown}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFormData({ ...formData, useDropdown: e.target.checked, district: '', location: '' })
                          }
                        />
                      }
                      label={t.myAds.districtDropdownLabel}
                    />
                  </Grid>
                  {formData.useDropdown ? (
                    <Grid item xs={12}>
                      <TextField
                        label={t.myAds.districtFieldLabel}
                        fullWidth
                        select
                        value={formData.district}
                        onChange={(e: SelectChangeEvent<string>) =>
                          setFormData({ ...formData, district: e.target.value })
                        }
                      >
                        <MenuItem value="">{t.myAds.selectDistrict}</MenuItem>
                        {mersinDistricts.map((district: string) => (
                          <MenuItem key={district} value={district}>
                            {district}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <TextField
                        label={t.myAds.manualLocationLabel}
                        fullWidth
                        value={formData.location}
                        onChange={(e: InputChangeEvent) => setFormData({ ...formData, location: e.target.value })}
                        placeholder={t.myAds.manualLocationPlaceholder}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button variant="outlined" component="label" fullWidth>
                      {t.admin.uploadImages}
                      <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                    </Button>
                    {imageFiles.length > 0 && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {imageFiles.length} {t.admin.filesSelected}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={saving || isLimitReached || isPostingBlocked}
                    >
                      {saving ? <CircularProgress size={24} color="inherit" /> : t.myAds.formSubmitCreate}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t.myAds.listingsTab}
                </Typography>
                {userItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t.myAds.noListings}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {userItems.map((item: Item) => {
                      const priceLabel = formatPrice(item.discountPrice ?? item.price, item.currency || 'USD');
                      const isSold = item.status === 'sold';
                      return (
                        <Box
                          key={item.id}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {priceLabel}
                          </Typography>
                          {item.location && (
                            <Typography variant="body2" color="primary" fontWeight={600}>
                              📍 {item.location}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {item.createdAt ? item.createdAt.toLocaleDateString() : ''}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={resolveStatusLabel(item.status)}
                              color={resolveStatusColor(item.status)}
                              size="small"
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {isSold ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleUpdateItemStatus(item.id, 'on_sale')}
                                  disabled={statusUpdatingId === item.id}
                                >
                                  {statusUpdatingId === item.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    t.myAds.markAsAvailable
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  onClick={() => handleUpdateItemStatus(item.id, 'sold')}
                                  disabled={statusUpdatingId === item.id}
                                >
                                  {statusUpdatingId === item.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    t.myAds.markAsSold
                                  )}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t.myAds.conversationsTab}
                </Typography>
                {conversationsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : conversations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t.myAds.conversationsEmpty}
                  </Typography>
                ) : (
                  <List sx={{ maxHeight: 480, overflowY: 'auto' }}>
                    {conversations.map((conversation: Inquiry) => {
                      const partnerInfo = getConversationPartnerInfo(conversation);
                      const isUnread = conversation.unreadFor?.includes(currentUserId);
                      return (
                        <ListItemButton
                          key={conversation.id}
                          selected={conversation.id === selectedConversationId}
                          onClick={() => handleSelectConversation(conversation.id)}
                          alignItems="flex-start"
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: isUnread ? 'action.hover' : undefined,
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={isUnread ? 700 : 600} noWrap>
                                {conversation.itemTitle || t.myAds.itemLabel}
                              </Typography>
                              {isUnread && (
                                <Chip label={t.myAds.unreadBadge} size="small" color="primary" />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {partnerInfo.label}: {partnerInfo.name || t.common.loading}
                            </Typography>
                            <Typography variant="body2" color="text.primary" noWrap>
                              {getConversationPreview(conversation)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getConversationTimestamp(conversation)}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
                {selectedConversation ? (
                  <>
                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedConversation.itemTitle || t.myAds.itemLabel}
                        </Typography>
                        {(() => {
                          const partnerInfo = getConversationPartnerInfo(selectedConversation);
                          return (
                            <Typography variant="body2" color="text.secondary">
                              {partnerInfo.label}: {partnerInfo.name || t.common.loading}
                            </Typography>
                          );
                        })()}
                        <Typography variant="caption" color="text.secondary">
                          {t.myAds.lastMessageAt}: {getConversationTimestamp(selectedConversation)}
                        </Typography>
                      </Box>
                      <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        onClick={() => handleHideConversation(selectedConversation.id)}
                        disabled={conversationActionLoading}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {conversationActionLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          t.myAds.hideConversation
                        )}
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      {messagesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={28} />
                        </Box>
                      ) : messages.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          {t.messages.empty}
                        </Typography>
                      ) : (
                        messages.map((message: InquiryMessage) => {
                          const isOwn = message.senderId === user?.uid;
                          return (
                            <Box
                              key={message.id}
                              sx={{
                                display: 'flex',
                                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                mb: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  maxWidth: '80%',
                                  backgroundColor: isOwn ? 'primary.main' : 'grey.200',
                                  color: isOwn ? 'primary.contrastText' : 'text.primary',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                  {message.senderName}
                                </Typography>
                                <Typography variant="body2">{message.text}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {message.createdAt?.toLocaleString?.() ?? ''}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })
                      )}
                      <Box ref={messagesEndRef} />
                    </Box>
                    <Box
                      component="form"
                      onSubmit={handleSendMessage}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <TextField
                        label={t.myAds.messagePlaceholder}
                        multiline
                        minRows={2}
                        value={messageInput}
                        onChange={(e: InputChangeEvent) => setMessageInput(e.target.value)}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={sendingMessage}
                          endIcon={sendingMessage ? <CircularProgress size={18} color="inherit" /> : undefined}
                        >
                          {t.myAds.sendMessage}
                        </Button>
                      </Box>
                    </Box>
                  </>
                ) : conversationsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {t.myAds.selectConversation}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default MyAdvertisementsPage;
