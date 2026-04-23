import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { supabase } from './supabase.js'
import { fetchLinkedInProfile } from './api.js'

const LOTTIE_SEARCH_URL = 'https://lottie.host/cac13254-43b1-4bd0-ac55-e50d0e84e019/4Ynzhir5gG.lottie'

const PEOPLE = [
  {
    id:     'eduardo',
    name:   'Eduardo Schuch',
    short:  'Eduardo',
    avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQHJVAnJESbRmQ/profile-displayphoto-scale_400_400/B4DZm6SnC2GsAg-/0/1759767069712?e=1778716800&v=beta&t=qN_Za2ALLLnjWrv8HKaPJCZFd3X1VIRndQIMbA95JdI',
  },
  {
    id:     'marcos',
    name:   'Marcos Hollmann',
    short:  'Marcos',
    avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQGYm3ezvCS4jA/profile-displayphoto-crop_800_800/B4DZuy1aCKJMAI-/0/1768231906532?e=1778716800&v=beta&t=nf1QQ3MJtWcmOOLJnP8KZ99-g15wFd0oqopg7JlpZQU',
  },
]
function getPerson(id) { return PEOPLE.find(p => p.id === id) || PEOPLE[0] }

// ── Themes ────────────────────────────────────────────────────────────────────

const DARK = {
  bg:               '#07090f',
  surface:          '#0d1117',
  surface2:         '#0f1923',
  surface3:         '#131e2e',
  border:           '#1c2a3a',
  border2:          '#243447',
  text:             '#f0f6ff',
  text2:            '#8aa0b8',
  muted:            '#4b6080',
  muted2:           '#2d4060',
  cyan:             '#00d0ff',
  cyanBtn:          '#00d0ff',
  cyanBtnText:      '#07090f',
  cyanDim:          'rgba(0,208,255,0.08)',
  cyanGlow:         '0 0 20px rgba(0,208,255,0.3)',
  cyanGlowHover:    '0 0 32px rgba(0,208,255,0.5)',
  amber:            '#f59e0b',
  amberDim:         'rgba(245,158,11,0.06)',
  amberDimHover:    'rgba(245,158,11,0.11)',
  waitDim:          'rgba(0,208,255,0.04)',
  waitDimHover:     'rgba(0,208,255,0.09)',
  inputBg:          '#07090f',
  headerBg:         'rgba(7,9,15,0.75)',
  overlayBg:        'rgba(7,9,15,0.82)',
  modalShadow:      '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,208,255,0.07)',
  tableShadow:      '0 0 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,208,255,0.04)',
  emptyIconBg:      'rgba(0,208,255,0.08)',
  emptyIconBorder:  'rgba(0,208,255,0.15)',
  closeBtn:         '#1c2a3a',
  errorBg:          'rgba(239,68,68,0.08)',
  errorBorder:      'rgba(239,68,68,0.2)',
  errorText:        '#fca5a5',
  spinnerBg:        'rgba(0,208,255,0.3)',
  isDark:           true,
}

const LIGHT = {
  bg:               '#eef2f7',
  surface:          '#ffffff',
  surface2:         '#f4f7fb',
  surface3:         '#e8edf5',
  border:           '#d4dce8',
  border2:          '#c0cdd e',
  text:             '#0d1829',
  text2:            '#3d5570',
  muted:            '#6b88a8',
  muted2:           '#a0b4c8',
  cyan:             '#0077bb',
  cyanBtn:          '#0077bb',
  cyanBtnText:      '#ffffff',
  cyanDim:          'rgba(0,119,187,0.08)',
  cyanGlow:         '0 0 16px rgba(0,119,187,0.18)',
  cyanGlowHover:    '0 0 24px rgba(0,119,187,0.32)',
  amber:            '#d97706',
  amberDim:         'rgba(217,119,6,0.06)',
  amberDimHover:    'rgba(217,119,6,0.11)',
  waitDim:          'rgba(0,119,187,0.05)',
  waitDimHover:     'rgba(0,119,187,0.1)',
  inputBg:          '#f4f7fb',
  headerBg:         'rgba(238,242,247,0.88)',
  overlayBg:        'rgba(13,24,41,0.55)',
  modalShadow:      '0 16px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,119,187,0.1)',
  tableShadow:      '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,119,187,0.08)',
  emptyIconBg:      'rgba(0,119,187,0.06)',
  emptyIconBorder:  'rgba(0,119,187,0.15)',
  closeBtn:         '#d4dce8',
  errorBg:          'rgba(220,38,38,0.06)',
  errorBorder:      'rgba(220,38,38,0.18)',
  errorText:        '#dc2626',
  spinnerBg:        'rgba(0,119,187,0.25)',
  isDark:           false,
}

const ThemeCtx = createContext(DARK)
const useTheme = () => useContext(ThemeCtx)

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'agora mesmo'
  if (mins  < 60) return `há ${mins}min`
  if (hours < 24) return `há ${hours}h`
  if (days  < 30) return `há ${days} dia${days > 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  return `há ${months} ${months > 1 ? 'meses' : 'mês'}`
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

const AVATAR_COLORS = ['#0891b2','#0e7490','#1d4ed8','#7c3aed','#059669','#b45309','#be185d']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const CATEGORIES = [
  { value: 'investor',  label: 'Investidor',       color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { value: 'client',    label: 'Cliente',           color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  { value: 'outreach',  label: 'LinkedIn Outreach', color: '#00d0ff', bg: 'rgba(0,208,255,0.1)'   },
  { value: 'inbound',   label: 'LinkedIn Inbound',  color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)'  },
  { value: 'event',     label: 'Evento',            color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  { value: 'referral',  label: 'Indicação',         color: '#fb923c', bg: 'rgba(251,146,60,0.1)'  },
  { value: 'x',         label: 'X',                 color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)' },
  { value: 'other',     label: 'Outro',             color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
]
function getCat(v) { return CATEGORIES.find(c => c.value === v) || CATEGORIES[7] }

function sortContacts(list) {
  return [...list].sort((a, b) => {
    if (a.action_owner === 'mine' && b.action_owner !== 'mine') return -1
    if (a.action_owner !== 'mine' && b.action_owner === 'mine') return  1
    return new Date(a.updated_at) - new Date(b.updated_at)
  })
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ url, name, size = 44 }) {
  const [err, setErr] = useState(false)
  const t = useTheme()
  if (url && !err) {
    return (
      <img src={url} alt={name} width={size} height={size} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: t.border }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: avatarColor(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
      fontSize: size * 0.36, color: '#fff', letterSpacing: '0.02em',
    }}>
      {initials(name)}
    </div>
  )
}

// ── Badges ────────────────────────────────────────────────────────────────────

function CategoryBadge({ value }) {
  const cat = getCat(value)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 11px', borderRadius: 20,
      fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
      color: cat.color, background: cat.bg,
      border: `1px solid ${cat.color}30`,
      whiteSpace: 'nowrap',
    }}>
      {cat.label}
    </span>
  )
}

function ActionBadge({ owner }) {
  const t = useTheme()
  const isMine = owner === 'mine'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 12, fontWeight: 500,
      color:      isMine ? t.amber : t.cyan,
      background: isMine ? t.amberDim : t.cyanDim,
      border:     `1px solid ${isMine ? t.amber : t.cyan}30`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: isMine ? t.amber : t.cyan, flexShrink: 0 }} />
      {isMine ? 'Minha ação' : 'Aguardando'}
    </span>
  )
}

function Spinner({ size = 16, color }) {
  const t = useTheme()
  const c = color || t.cyan
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid ${c}30`, borderTopColor: c,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ── Theme Toggle ──────────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }) {
  const t = useTheme()
  return (
    <button onClick={onToggle} title={isDark ? 'Modo claro' : 'Modo escuro'} style={{
      width: 34, height: 34, borderRadius: 8,
      background: t.surface3, border: `1px solid ${t.border}`,
      color: t.muted, fontSize: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}>
      {isDark ? '☀' : '🌙'}
    </button>
  )
}

// ── Edit Popover ──────────────────────────────────────────────────────────────

function EditPopover({ contact, anchorRect, onClose, onSave }) {
  const t = useTheme()
  const [owner,  setOwner]  = useState(contact.action_owner || 'mine')
  const [action, setAction] = useState(contact.next_action  || '')
  const [saving, setSaving] = useState(false)
  const ref = useRef()

  const top  = anchorRect.bottom + 8
  const left = Math.min(anchorRect.left, window.innerWidth - 340)

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 50)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handle) }
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    try {
      const updated_at = new Date().toISOString()
      const { error } = await supabase.from('crm')
        .update({ next_action: action, action_owner: owner, updated_at }).eq('id', contact.id)
      if (error) throw error
      onSave({ ...contact, next_action: action, action_owner: owner, updated_at })
    } finally { setSaving(false) }
  }

  return createPortal(
    <div ref={ref} onClick={e => e.stopPropagation()} style={{
      position: 'fixed', top, left, zIndex: 9999, width: 320,
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 14, padding: '16px',
      boxShadow: t.modalShadow,
      animation: 'popoverIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
    }}>
      <div style={{ display: 'flex', marginBottom: 12, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}` }}>
        {[
          { val: 'mine',    label: 'Minha ação', color: t.amber, bg: t.amberDim },
          { val: 'waiting', label: 'Aguardando', color: t.cyan,  bg: t.cyanDim  },
        ].map(({ val, label, color, bg }, i) => {
          const active = owner === val
          return (
            <button key={val} onClick={() => setOwner(val)} style={{
              flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500,
              background: active ? bg : 'transparent',
              color: active ? color : t.muted,
              borderRight: i === 0 ? `1px solid ${t.border}` : 'none',
              transition: 'all 0.15s',
            }}>{label}</button>
          )
        })}
      </div>

      <textarea value={action} onChange={e => setAction(e.target.value)}
        placeholder="Qual é o próximo passo?" rows={3}
        style={{
          width: '100%', resize: 'none',
          background: t.inputBg, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: '8px 10px',
          color: t.text, fontSize: 13, marginBottom: 12,
        }}
      />

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '9px', borderRadius: 8,
        background: saving ? t.border : t.cyanBtn,
        color: saving ? t.muted : t.cyanBtnText,
        fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {saving ? <><Spinner size={14} color={t.muted} /> Salvando…</> : 'Salvar'}
      </button>
    </div>,
    document.body
  )
}

// ── Contact Row ───────────────────────────────────────────────────────────────

function ContactRow({ contact, index, isNew, onUpdate }) {
  const t = useTheme()
  const [anchorRect, setAnchorRect] = useState(null)
  const rowRef = useRef()
  const isMine = contact.action_owner === 'mine'

  const baseBg  = isMine ? t.amberDim      : t.waitDim
  const hoverBg = isMine ? t.amberDimHover : t.waitDimHover

  function handleRowClick() {
    if (anchorRect) { setAnchorRect(null); return }
    setAnchorRect(rowRef.current.getBoundingClientRect())
  }

  return (
    <>
      <div ref={rowRef} onClick={handleRowClick} style={{
        animation: `fadeInRow 0.4s cubic-bezier(0.16,1,0.3,1) ${isNew ? 0 : index * 45}ms both`,
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 24px',
        background: baseBg,
        borderBottom: `1px solid ${t.border}55`,
        cursor: 'pointer', transition: 'background 0.15s', userSelect: 'none',
      }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = baseBg}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: isMine ? t.amber : t.cyan,
        }} />

        <Avatar url={contact.avatar_url} name={contact.full_name} size={44} />

        <div style={{ flex: '0 0 230px', minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact.full_name || '–'}
          </div>
          <div style={{ fontSize: 13, color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
            {contact.headline || '–'}
          </div>
        </div>

        <div style={{ flex: '0 0 170px' }}>
          <CategoryBadge value={contact.category} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: t.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
            {contact.next_action || <span style={{ color: t.muted2, fontStyle: 'italic' }}>Sem ação definida</span>}
          </div>
          <ActionBadge owner={contact.action_owner} />
        </div>

        {/* Responsável */}
        <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {(() => {
            const person = getPerson(contact.responsible)
            return (
              <>
                <img src={person.avatar} alt={person.name} width={26} height={26}
                  style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.short}
                </span>
              </>
            )
          })()}
        </div>

        <div style={{ flex: '0 0 90px', textAlign: 'right', fontSize: 12, color: t.muted2 }}>
          {timeAgo(contact.updated_at || contact.created_at)}
        </div>

        <div style={{ flex: '0 0 170px', display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
          {contact.company_logo && (
            <img src={contact.company_logo} alt="" width={22} height={22}
              style={{ borderRadius: 5, objectFit: 'contain', background: t.border, padding: 2, flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <span style={{ fontSize: 13, color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact.company || '–'}
          </span>
        </div>
      </div>

      {anchorRect && (
        <EditPopover
          contact={contact} anchorRect={anchorRect}
          onClose={() => setAnchorRect(null)}
          onSave={updated => { onUpdate(updated); setAnchorRect(null) }}
        />
      )}
    </>
  )
}

// ── Add Modal ─────────────────────────────────────────────────────────────────

function AddModal({ onClose, onAdded }) {
  const t = useTheme()
  const [url,         setUrl]         = useState('')
  const [category,    setCategory]    = useState('investor')
  const [responsible, setResponsible] = useState('eduardo')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const overlayRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) { setError('Informe a URL do LinkedIn.'); return }
    setError(''); setLoading(true)
    try {
      const profile = await fetchLinkedInProfile(url.trim())
      const record = {
        linkedin_url: url.trim(), full_name: profile.full_name,
        headline: profile.headline, avatar_url: profile.avatar_url,
        company: profile.company, company_logo: profile.company_logo,
        category, next_action: '', action_owner: 'mine', responsible,
      }
      const { data, error: dbErr } = await supabase.from('crm').insert(record).select().single()
      if (dbErr) throw dbErr
      onAdded(data); onClose()
    } catch (err) {
      console.error('[AddModal]', err)
      setError(err.message || 'Erro ao buscar perfil. Verifique a URL.')
    } finally { setLoading(false) }
  }

  return (
    <div ref={overlayRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: t.overlayBg, backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'overlayIn 0.2s ease forwards',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480, margin: '0 16px',
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 18, padding: '28px 28px 24px',
        boxShadow: t.modalShadow,
        animation: 'fadeScale 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 20, color: t.text }}>
            Adicionar Contato
          </h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, background: t.closeBtn,
            color: t.muted, fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 16px' }}>
            <DotLottieReact src={LOTTIE_SEARCH_URL} loop autoplay style={{ width: 90, height: 90 }} />
            <div style={{ color: t.muted, fontSize: 14, marginTop: 4 }}>Buscando perfil…</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.muted, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                URL do LinkedIn
              </div>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://linkedin.com/in/nome"
                style={{
                  width: '100%', padding: '10px 12px',
                  background: t.inputBg, border: `1px solid ${t.border}`,
                  borderRadius: 10, color: t.text, fontSize: 14,
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.muted, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Categoria
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)} style={{
                    padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: category === cat.value ? cat.bg : 'transparent',
                    color:      category === cat.value ? cat.color : t.muted,
                    border:     `1px solid ${category === cat.value ? cat.color + '50' : t.border}`,
                    transition: 'all 0.15s',
                  }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </label>

            <label style={{ display: 'block', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.muted, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Responsável
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {PEOPLE.map(person => {
                  const active = responsible === person.id
                  return (
                    <button key={person.id} type="button" onClick={() => setResponsible(person.id)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: active ? t.cyanDim : 'transparent',
                      border: `1px solid ${active ? t.cyan + '50' : t.border}`,
                      transition: 'all 0.15s',
                    }}>
                      <img src={person.avatar} alt={person.name} width={30} height={30}
                        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: active ? t.cyan : t.muted }}>
                        {person.short}
                      </span>
                    </button>
                  )
                })}
              </div>
            </label>

            {error && (
              <div style={{
                marginBottom: 14, padding: '10px 12px',
                background: t.errorBg, border: `1px solid ${t.errorBorder}`,
                borderRadius: 8, fontSize: 13, color: t.errorText,
              }}>{error}</div>
            )}

            <button type="submit" style={{
              width: '100%', padding: '11px', borderRadius: 10,
              background: t.cyanBtn, color: t.cyanBtnText,
              fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: t.cyanGlow,
            }}>
              <span style={{ fontSize: 17 }}>+</span> Adicionar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: t.emptyIconBg, border: `1px solid ${t.emptyIconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
      }}>🤝</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 22, color: t.text, marginBottom: 8 }}>
          Nenhum contato ainda
        </div>
        <div style={{ color: t.muted, fontSize: 15, maxWidth: 300, lineHeight: 1.6 }}>
          Adicione contatos do LinkedIn para acompanhar sua rede e próximas ações.
        </div>
      </div>
      <button onClick={onAdd} style={{
        padding: '10px 24px', borderRadius: 10,
        background: t.cyanBtn, color: t.cyanBtnText,
        fontWeight: 700, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 17 }}>+</span> Adicionar primeiro contato
      </button>
    </div>
  )
}

// ── Table Header ──────────────────────────────────────────────────────────────

function TableHeader() {
  const t = useTheme()
  const col = (label, flex, align = 'left') => (
    <div style={{ flex, fontSize: 11, fontWeight: 600, color: t.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: align }}>
      {label}
    </div>
  )
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '10px 24px', borderBottom: `1px solid ${t.border}`,
      background: t.surface,
    }}>
      <div style={{ width: 44, flexShrink: 0 }} />
      {col('Contato',      '0 0 230px')}
      {col('Categoria',    '0 0 170px')}
      {col('Próxima ação', 1)}
      {col('Responsável',  '0 0 120px')}
      {col('Atualizado',   '0 0 90px',  'right')}
      {col('Empresa',      '0 0 170px', 'right')}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark,    setIsDark]    = useState(true)
  const [contacts,  setContacts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newIds,    setNewIds]    = useState(new Set())

  const t = isDark ? DARK : LIGHT

  // Sync body background with theme
  useEffect(() => {
    document.body.style.background = t.bg
  }, [isDark])

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('crm').select('*').order('updated_at', { ascending: true })
      if (error) console.error('[Supabase] load error:', error)
      else setContacts(sortContacts(data || []))
      setLoading(false)
    }
    load()
  }, [])

  const handleAdded = useCallback(contact => {
    setContacts(prev => sortContacts([...prev, contact]))
    setNewIds(prev => new Set([...prev, contact.id]))
    setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(contact.id); return s }), 1000)
  }, [])

  const handleUpdate = useCallback(updated => {
    setContacts(prev => sortContacts(prev.map(c => c.id === updated.id ? updated : c)))
  }, [])

  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: `1px solid ${t.border}`,
          background: t.headerBg,
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 20, color: t.text, lineHeight: 1, letterSpacing: '-0.01em' }}>
                Isla CRM
              </h1>
              <div style={{ fontSize: 11, color: t.muted2, marginTop: 3 }}>
                {contacts.length} contato{contacts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 20px', borderRadius: 10,
                background: t.cyanBtn, color: t.cyanBtnText,
                fontWeight: 700, fontSize: 13,
                boxShadow: t.cyanGlow, transition: 'box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = t.cyanGlowHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = t.cyanGlow;      e.currentTarget.style.transform = '' }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Adicionar Contato
            </button>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex: 1, padding: '0 32px 40px' }}>
          <div style={{
            marginTop: 28,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16, overflow: 'hidden',
            boxShadow: t.tableShadow,
          }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: t.muted, fontSize: 15 }}>
                <Spinner size={18} /> Carregando contatos…
              </div>
            ) : contacts.length === 0 ? (
              <EmptyState onAdd={() => setShowModal(true)} />
            ) : (
              <>
                <TableHeader />
                {contacts.map((c, i) => (
                  <ContactRow key={c.id} contact={c} index={i} isNew={newIds.has(c.id)} onUpdate={handleUpdate} />
                ))}
              </>
            )}
          </div>
        </main>

        {showModal && <AddModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
      </div>
    </ThemeCtx.Provider>
  )
}
