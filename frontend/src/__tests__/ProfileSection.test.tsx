import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateProfile } from 'firebase/auth';
import ProfileSection from '@/components/settings/ProfileSection';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: { uid: 'u1', email: 'a@b.com', displayName: 'Old Name', photoURL: null },
  },
}));
vi.mock('firebase/auth', () => ({ updateProfile: vi.fn() }));

const mockedUpdate = vi.mocked(updateProfile);

const signedIn = {
  auth: {
    status: 'authenticated' as const,
    user: { uid: 'u1', email: 'a@b.com', name: 'Old Name', photo: null },
  },
};

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Behave like Firebase: updateProfile mutates the current user
    mockedUpdate.mockImplementation(async (user, profile) => {
      Object.assign(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });
    });
  });

  it('starts with the current name and a disabled save button', () => {
    renderWithProviders(<ProfileSection />, signedIn);
    expect(screen.getByLabelText('Display name')).toHaveValue('Old Name');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('saves a new name and updates the store', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ProfileSection />, signedIn);

    const input = screen.getByLabelText('Display name');
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(store.getState().auth.user?.name).toBe('New Name'));
    expect(screen.getByText('Profile updated.')).toBeInTheDocument();
  });

  it('blocks an empty name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />, signedIn);

    await user.clear(screen.getByLabelText('Display name'));

    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('rejects an invalid photo URL', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />, signedIn);

    await user.type(screen.getByLabelText(/Photo URL/), 'not a url');

    expect(screen.getByText('Enter a valid http(s) image URL.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('shows an error when saving fails and leaves the store alone', async () => {
    mockedUpdate.mockRejectedValueOnce(new Error('network'));
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ProfileSection />, signedIn);

    const input = screen.getByLabelText('Display name');
    await user.clear(input);
    await user.type(input, 'Another');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save your profile");
    expect(store.getState().auth.user?.name).toBe('Old Name');
  });
});