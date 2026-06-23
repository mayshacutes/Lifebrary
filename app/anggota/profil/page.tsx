// app/anggota/profil/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Clock, AlertCircle, Edit } from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  username: string;
  created_at: string;
  member_id: string;
}

export default function AnggotaProfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    returned: 0,
    activeLoans: 0,
    totalFine: 0
  });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (userError) throw userError;

      setProfile({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        username: user.username,
        created_at: user.created_at,
        member_id: `LIB-${user.id.slice(0, 8)}`
      });

      // Get loan stats
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select(`
          id,
          status,
          returns(fine)
        `)
        .eq('user_id', userData.user.id);

      if (loansError) throw loansError;

      const total = loans?.length || 0;
      const returned = loans?.filter(l => l.status === 'returned').length || 0;
      const active = loans?.filter(l => l.status === 'borrowed').length || 0;
      const fines = loans?.reduce((sum, l) => sum + (l.returns?.[0]?.fine || 0), 0) || 0;

      setStats({
        totalBorrowed: total,
        returned: returned,
        activeLoans: active,
        totalFine: fines
      });

      // Get recent loans
      const { data: recent, error: recentError } = await supabase
        .from('loans')
        .select(`
          id,
          loan_date,
          due_date,
          status,
          returns(return_date),
          loan_details (
            book:books (title)
          )
        `)
        .eq('user_id', userData.user.id)
        .order('loan_date', { ascending: false })
        .limit(3);

      if (recentError) throw recentError;

      setRecentLoans(recent || []);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ color: '#6B7280' }}>Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ color: '#6B7280' }}>Profile not found</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>Profil Saya</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Informasi akun dan data diri</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div>
            {/* Data Diri */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Data Diri</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Nama Lengkap</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{profile.full_name}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Email</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{profile.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>No. Telepon</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{profile.phone || '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Username</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{profile.username}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Alamat</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>{profile.address || '-'}</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
                <button style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  Edit Profil
                </button>
                <button style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  Ubah Password
                </button>
              </div>
            </div>

            {/* Statistik Saya */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Statistik Saya</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Total Dipinjam</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>{stats.totalBorrowed}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Dikembalikan</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{stats.returned}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Sedang Dipinjam</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4F46E5' }}>{stats.activeLoans}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Total Denda</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#EF4444' }}>Rp {stats.totalFine.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Profile Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#4F46E5' }}>
                  {profile.full_name.charAt(0)}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{profile.full_name}</h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{profile.email}</p>
              <p style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '500', marginTop: '4px' }}>{profile.member_id}</p>
            </div>

            {/* Informasi Keanggotaan */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Informasi Keanggotaan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Terdaftar Sejak</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                    {new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Berlaku Hingga</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                    {new Date(new Date(profile.created_at).setFullYear(new Date(profile.created_at).getFullYear() + 3)).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Jenis Anggota</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>Reguler</p>
                </div>
              </div>
            </div>

            {/* Riwayat Peminjaman Terbaru */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Riwayat Peminjaman Terbaru</h2>
              {recentLoans.length > 0 ? (
                recentLoans.map((loan) => (
                  <div key={loan.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                      {loan.loan_details?.[0]?.book?.title || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {new Date(loan.loan_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {loan.returns?.[0]?.return_date && ` - ${new Date(loan.returns[0].return_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#9CA3AF', textAlign: 'center' }}>Belum ada riwayat peminjaman</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}