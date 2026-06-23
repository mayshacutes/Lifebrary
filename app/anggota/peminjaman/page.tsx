// app/anggota/peminjaman/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Loan {
  id: string;
  title: string;
  author: string;
  due_date: string;
  loan_date: string;
  status: string;
  isLate: boolean;
  fine: number;
  daysRemaining: number;
}

export default function AnggotaPeminjamanPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    late: 0,
    totalFine: 0,
    nearestDue: null as string | null
  });
  const [quota, setQuota] = useState({ used: 0, max: 5 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: loans, error } = await supabase
        .from('loans')
        .select(`
          id,
          loan_date,
          due_date,
          status,
          loan_details (
            book:books (
              title,
              author
            )
          )
        `)
        .eq('user_id', userData.user.id)
        .eq('status', 'borrowed')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const formattedLoans = loans?.map(loan => {
        const dueDate = new Date(loan.due_date);
        const isLate = dueDate < today;
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: loan.id,
          title: (loan.loan_details as any)?.[0]?.book?.title || "Unknown",
          author: (loan.loan_details as any)?.[0]?.book?.author || "Unknown",
          due_date: loan.due_date,
          loan_date: loan.loan_date,
          status: loan.status,
          isLate: isLate,
          fine: isLate ? 5000 : 0,
          daysRemaining: isLate ? -diffDays : diffDays
        };
      }) || [];

      setLoans(formattedLoans);

      const lateLoans = formattedLoans.filter(l => l.isLate);
      const totalFine = lateLoans.reduce((sum, l) => sum + l.fine, 0);
      const nearest = formattedLoans.length > 0 ? formattedLoans[0] : null;

      setStats({
        active: formattedLoans.length,
        late: lateLoans.length,
        totalFine: totalFine,
        nearestDue: nearest?.due_date || null
      });

      setQuota({
        used: formattedLoans.length,
        max: 5
      });

    } catch (error) {
      console.error('Error fetching data:', error);
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

  return (
    <div style={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>Peminjaman Saya</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Kelola peminjaman buku Anda</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Sedang Dipinjam</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>{stats.active}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Terlambat</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>{stats.late}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Total Denda</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>Rp {stats.totalFine.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Tenggat Terdekat</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
              {stats.nearestDue ? new Date(stats.nearestDue).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
            </p>
          </div>
        </div>

        {/* Alert */}
        {stats.late > 0 && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#991B1B' }}>
                {stats.late} buku melewati batas waktu peminjaman!
              </p>
              <p style={{ fontSize: '14px', color: '#991B1B' }}>
                Segera kembalikan untuk menghindari denda tambahan. Denda saat ini: Rp {stats.totalFine.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Active Loans */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '16px' }}>Detail Peminjaman Aktif</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <div key={loan.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#1F2937' }}>{loan.title}</h3>
                      <p style={{ fontSize: '14px', color: '#9CA3AF' }}>{loan.author}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', backgroundColor: loan.isLate ? '#FEF2F2' : '#ECFDF5', color: loan.isLate ? '#EF4444' : '#10B981' }}>
                      {loan.isLate ? 'Terlambat' : 'Aktif'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', fontSize: '14px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Tanggal Pinjam</p>
                      <p style={{ color: '#374151' }}>{new Date(loan.loan_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Jatuh Tempo</p>
                      <p style={{ color: '#374151' }}>{new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Denda</p>
                      <p style={{ color: loan.isLate ? '#EF4444' : '#6B7280', fontWeight: loan.isLate ? '500' : 'normal' }}>
                        {loan.isLate ? `Rp ${loan.fine.toLocaleString()}` : 'Tidak ada'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    <p style={{ color: loan.isLate ? '#EF4444' : '#10B981' }}>
                      {loan.isLate 
                        ? `${Math.abs(loan.daysRemaining)} hari terlambat` 
                        : `${loan.daysRemaining} hari tersisa`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                Tidak ada peminjaman aktif
              </div>
            )}
          </div>
        </div>

        {/* Kuota & Pinjam Button */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>
              Kuota Peminjaman: <span style={{ fontWeight: '600' }}>{quota.used}</span> / {quota.max} buku
            </p>
          </div>
          <Link
            href="/anggota/katalog"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', backgroundColor: '#4F46E5', color: '#FFFFFF', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Pinjam Buku Baru
          </Link>
        </div>
      </div>
    </div>
  );
}