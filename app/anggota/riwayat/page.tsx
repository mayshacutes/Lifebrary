// app/anggota/riwayat/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  author: string;
  loan_date: string;
  return_date: string | null;
  status: string;
  isLate: boolean;
  fine: number;
  duration: number;
}

export default function AnggotaRiwayatPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [year, setYear] = useState('2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    totalFine: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchHistory();
  }, [filter, year]);

  const fetchHistory = async () => {
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
          returns(return_date, late_days, fine),
          loan_details (
            book:books (
              title,
              author
            )
          )
        `)
        .eq('user_id', userData.user.id)
        .neq('status', 'borrowed')
        .order('loan_date', { ascending: false });

      if (error) throw error;

      const formattedHistory = loans?.map(loan => {
        const loanDate = new Date(loan.loan_date);
        const returnDate = loan.returns?.[0]?.return_date;
        const isLate = loan.returns?.[0]?.late_days > 0 || false;
        const fine = loan.returns?.[0]?.fine || 0;
        
        let duration = 14;
        if (returnDate) {
          const diffTime = Math.abs(new Date(returnDate).getTime() - loanDate.getTime());
          duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: loan.id,
          title: (loan.loan_details as any)?.[0]?.book?.title || "Unknown",
          author: (loan.loan_details as any)?.[0]?.book?.author || "Unknown",
          loan_date: loan.loan_date,
          return_date: returnDate,
          status: loan.status,
          isLate: isLate,
          fine: fine,
          duration: duration
        };
      }) || [];

      const filtered = formattedHistory.filter(item => {
        const yearMatch = new Date(item.loan_date).getFullYear().toString() === year;
        return yearMatch;
      });

      setHistory(filtered);

      const total = filtered.length;
      const onTime = filtered.filter(h => !h.isLate).length;
      const late = filtered.filter(h => h.isLate).length;
      const totalFine = filtered.reduce((sum, h) => sum + h.fine, 0);

      setStats({ total, onTime, late, totalFine });

    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'Tepat Waktu' && item.isLate) return false;
    if (filter === 'Terlambat' && !item.isLate) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(search) || 
             item.author.toLowerCase().includes(search);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedData = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (item: HistoryItem) => {
    if (item.isLate) return { bg: '#FEF2F2', text: '#EF4444' };
    return { bg: '#ECFDF5', text: '#10B981' };
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>Riwayat Peminjaman</h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Rekam jejak semua peminjaman kamu</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Total Dipinjam</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Tepat Waktu</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{stats.onTime}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Pernah Terlambat</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>{stats.late}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Total Denda</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>Rp {stats.totalFine.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['Semua', 'Tepat Waktu', 'Terlambat'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', backgroundColor: filter === status ? '#4F46E5' : '#F3F4F6', color: filter === status ? '#FFFFFF' : '#4B5563' }}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <button style={{ padding: '6px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download style={{ width: '16px', height: '16px' }} />
              Export
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Cari judul atau penulis..."
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '14px', backgroundColor: '#FFFFFF' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
            <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              {filteredHistory.length} transaksi
            </p>
          </div>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Buku</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Tgl Pinjam</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Tgl Kembali</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Durasi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Denda</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid #E5E7EB' }}>
              {paginatedData.map((item, index) => {
                const colors = getStatusColor(item);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: '500', color: '#1F2937' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.author}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                      {new Date(item.loan_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                      {item.return_date 
                        ? new Date(item.return_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{item.duration} hari</td>
                    <td style={{ padding: '12px 16px', color: '#EF4444' }}>
                      {item.fine > 0 ? `Rp ${item.fine.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', backgroundColor: colors.bg, color: colors.text }}>
                        {item.isLate ? 'Terlambat' : 'Tepat Waktu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                Menampilkan 1–{Math.min(itemsPerPage, filteredHistory.length)} dari {filteredHistory.length} riwayat
              </p>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid', backgroundColor: currentPage === pageNum ? '#4F46E5' : '#FFFFFF', color: currentPage === pageNum ? '#FFFFFF' : '#4B5563', borderColor: currentPage === pageNum ? '#4F46E5' : '#D1D5DB', cursor: 'pointer' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: '#FFFFFF', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}