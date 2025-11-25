import { useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Chip,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '../../config/firebase';
import { UserProfile } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminUser extends UserProfile {
  createdAt: Date;
}

type LanguageCode = 'ru' | 'en' | 'tr';

const UsersManager = () => {
  const { t, language } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    language: 'en' as LanguageCode,
    blockedFromPosting: false,
  });
  const [saving, setSaving] = useState(false);
  const controlsMapRef = useRef<Map<string, { blockedFromPosting?: boolean }>>(new Map());

  useEffect(() => {
    setLoading(true);

    const controlsUnsub = onSnapshot(collection(db, 'userControls'), (snapshot) => {
      const nextMap = new Map<string, { blockedFromPosting?: boolean }>();
      snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        nextMap.set(docSnap.id, docSnap.data() as { blockedFromPosting?: boolean });
      });
      controlsMapRef.current = nextMap;
      setUsers((prev) => mergeControlsIntoUsers(prev));
    });

    const usersUnsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const mapped = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data() as UserProfile & { createdAt?: any };
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          const control = controlsMapRef.current.get(docSnap.id);
          return {
            ...data,
            uid: docSnap.id,
            createdAt,
            blockedFromPosting: control?.blockedFromPosting ?? data.blockedFromPosting ?? false,
          } as AdminUser;
        });

        setUsers(
          mapped.sort((a: AdminUser, b: AdminUser) => b.createdAt.getTime() - a.createdAt.getTime())
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        enqueueSnackbar(t.admin.errorLoadingData, { variant: 'error' });
        setLoading(false);
      }
    );

    return () => {
      controlsUnsub();
      usersUnsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeControlsIntoUsers = (currentUsers: AdminUser[]) =>
    currentUsers.map((user) => ({
      ...user,
      blockedFromPosting:
        controlsMapRef.current.get(user.uid)?.blockedFromPosting ?? user.blockedFromPosting ?? false,
    }));

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (user: AdminUser) =>
        user.displayName.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower)
    );
  }, [users, search]);

  const resolveLanguageLabel = (code?: string) => {
    if (code === 'ru' || code === 'en' || code === 'tr') {
      return t.languageNames[code];
    }
    return t.languageNames.en;
  };

  const handleOpenDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      language: (user.language || language) as LanguageCode,
      blockedFromPosting: Boolean(user.blockedFromPosting),
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber || null,
        language: formData.language,
        blockedFromPosting: formData.blockedFromPosting,
      });

      await setDoc(
        doc(db, 'userControls', selectedUser.uid),
        { blockedFromPosting: formData.blockedFromPosting },
        { merge: true }
      );

      enqueueSnackbar(t.admin.userUpdated, { variant: 'success' });
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">{t.admin.manageUsers}</Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder={t.admin.searchUsersPlaceholder}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.admin.name}</TableCell>
              <TableCell>{t.admin.email}</TableCell>
              <TableCell>{t.profile.memberSince}</TableCell>
              <TableCell>{t.admin.postingAccess}</TableCell>
              <TableCell>{t.admin.languageLabel}</TableCell>
              <TableCell>{t.admin.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid} hover>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdAt?.toLocaleDateString?.() ?? ''}</TableCell>
                <TableCell>
                  <Chip
                    label={user.blockedFromPosting ? t.admin.blockedBadge : t.admin.activeBadge}
                    color={user.blockedFromPosting ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{resolveLanguageLabel(user.language)}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenDialog(user)}>
                    {t.admin.edit}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t.admin.editUser}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={t.admin.name}
                fullWidth
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t.admin.email} fullWidth value={formData.email} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t.admin.phoneNumber}
                fullWidth
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t.admin.languageLabel}
                select
                fullWidth
                value={formData.language}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, language: e.target.value as LanguageCode }))
                }
              >
                {(['en', 'ru', 'tr'] as LanguageCode[]).map((code) => (
                  <MenuItem key={code} value={code}>
                    {t.languageNames[code]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.blockedFromPosting}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, blockedFromPosting: e.target.checked }))
                    }
                  />
                }
                label={formData.blockedFromPosting ? t.admin.postingBlockedLabel : t.admin.postingAllowed}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t.admin.cancel}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : t.common.save}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManager;
