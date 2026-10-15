import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Icon from '../Components/Icons'

// Gifting customs we design around. Customs differ between families and
// regions — this is a friendly guide, not a rulebook.
const guides = [
  {
    id: 'birthday', title: 'Birthdays', culture: 'Sri Lankan, Indian & global', sub: 'BirthdayGift', tint: 'bg-cream',
    customs: [
      'In many Sri Lankan homes the day starts with kiribath (milk rice) and a visit to the temple, kovil, church or mosque, with cake cutting later with family and friends.',
      'Ribbon cake and chocolate biscuit pudding are local favourites; personalised cakes with names, themes and photos are now expected for milestone birthdays.',
      'Personal gifts — names, dates, inside jokes and photos — are what people remember most.',
    ],
    ideas: ['Photo print or themed cake', 'Custom photo mug or T-shirt', 'Chocolate bucket with a card', 'Party return gifts (ask in chat)'],
  },
  {
    id: 'housewarming', title: 'Housewarming', culture: 'Sinhala, Tamil & Indian homes', sub: 'HousewarmingGift', tint: 'bg-sage',
    customs: [
      'Sinhala families often boil milk until it overflows (kiri ithirima) at an auspicious time, a sign of prosperity for the new home.',
      'Tamil and Indian families hold a Griha Pravesh with a puja, a lit lamp and kolam at the doorway; gifts are often opened in front of guests, so presentation matters.',
      'An oil lamp, a plant or something for the home are classic choices. Many families prefer bright wrapping — red, yellow or green — over plain white or black for happy occasions.',
    ],
    ideas: ['Brass oil lamp set', 'Indoor plant with a tag', 'Family photo collage frame', 'Sweets for the guests'],
  },
  {
    id: 'wedding', title: 'Weddings & engagements', culture: 'Poruwa, Hindu, Muslim & Christian ceremonies', sub: 'WeddingGift', tint: 'bg-blush',
    customs: [
      'Cash in a decorated envelope is common at Sri Lankan and Indian weddings — Indian guests often use a shagun envelope and write their name on it.',
      'Keepsakes the couple will keep — framed photos, canvas prints and home pieces — make the most memorable gifts.',
      'Wedding cakes are often coordinated with the couple’s colours; homecoming cakes are popular in Sri Lanka too.',
    ],
    ideas: ['Two-tier wedding cake', 'Mr & Mrs keepsake frame', 'Wedding wishes hamper', 'Memory canvas print'],
  },
  {
    id: 'avurudu', title: 'Sinhala & Tamil New Year', culture: 'Avurudu / Puthandu · April', sub: 'AvuruduGift', tint: 'bg-cream',
    customs: [
      'Gifts are exchanged at the auspicious time for ganu denu; children receive small gifts and money from elders.',
      'Homes prepare kavum, kokis, athirasa and aluwa, and share them with neighbours and visiting relatives.',
      'Visiting family is expected — bringing sweets or fruit when you visit is always welcome.',
    ],
    ideas: ['Avurudu sweets hamper', 'New-clothes gift with a card', 'Gift for elders with a note'],
  },
  {
    id: 'diwali', title: 'Diwali', culture: 'Festival of Lights · Oct–Nov', sub: 'DiwaliGift', tint: 'bg-[#FBE7C8]',
    customs: [
      'Sweets (mithai), dry fruits and lamps (diyas) are the classic exchange between families, friends and colleagues.',
      'Religious idols or books suit spiritually-minded friends; decorative items brighten the home for the festival.',
    ],
    ideas: ['Mithai & diya box', 'Brass lamp set', 'Festive red & gold wrapping'],
  },
  {
    id: 'pongal', title: 'Thai Pongal', culture: 'Tamil harvest festival · January', sub: 'PongalGift', tint: 'bg-sage',
    customs: [
      'Families boil rice with milk and jaggery in a new clay pot until it overflows — a wish for abundance — and thank the sun for the harvest.',
      'New clothes, sugarcane and sweets are shared with family.',
    ],
    ideas: ['Pongal celebration hamper', 'Sweets box', 'Personalised card for family'],
  },
  {
    id: 'eid', title: 'Eid', culture: 'Eid al-Fitr & Eid al-Adha', sub: 'EidGift', tint: 'bg-lilac',
    customs: [
      'Dates, sweets, perfume (attar) and new clothes are traditional gifts; children often receive money (Eidi).',
      'Choose halal treats and avoid anything alcohol-related.',
    ],
    ideas: ['Dates & nuts gift box', 'Chocolates with an Eid Mubarak card'],
  },
  {
    id: 'christmas', title: 'Christmas', culture: 'December', sub: 'ChristmasGift', tint: 'bg-blush',
    customs: [
      'In Sri Lanka, rich Christmas cake and love cake are shared with neighbours and friends of every faith.',
      'Hampers of treats are a favourite for families and offices.',
    ],
    ideas: ['Christmas love cake hamper', 'Custom family mugs', 'Team gift hampers (ask in chat)'],
  },
  {
    id: 'baby', title: 'New baby & milestones', culture: 'Welcomes, graduations & more', sub: 'BabyGift', tint: 'bg-cream',
    customs: [
      'Gifts for a newborn are practical and soft — clothes, plush toys and care essentials — with something for the parents too.',
      'For graduations, a keepsake with the date and name turns the day into a lasting memory.',
    ],
    ideas: ['New baby welcome hamper', 'Graduation box', 'Canvas print of the big day'],
  },
]

const GiftGuide = () => {

  const { openChat } = useContext(ShopContext)

  return (
    <div>
      <section className='shell pt-14 pb-10 max-w-4xl'>
        <p className='eyebrow'>Gift guide</p>
        <h1 className='font-display font-semibold text-[2.75rem] sm:text-[4rem] leading-[1.03] mt-4'>The right gift for <span className='italic text-berry'>every tradition</span>.</h1>
        <p className='text-lg text-mauve leading-relaxed mt-5'>What people hope to receive changes with the occasion and the culture. Here is what we've learned about birthdays, housewarmings, weddings and festivals across Sinhala, Tamil, Indian, Muslim and Christian homes — and the gifts we make for each.</p>
        <nav aria-label='Occasions' className='flex flex-wrap gap-2 mt-8'>
          {guides.map(g => <a key={g.id} href={`#${g.id}`} className='px-4 py-2 rounded-full bg-white border border-rose-200 text-sm font-semibold hover:border-berry'>{g.title}</a>)}
        </nav>
      </section>

      <div className='shell flex flex-col gap-6'>
        {guides.map(g => (
          <section key={g.id} id={g.id} className='scroll-mt-28 rounded-[28px] bg-white border border-line overflow-hidden grid lg:grid-cols-[1.5fr_1fr]'>
            <div className='p-7 sm:p-10 flex flex-col gap-4'>
              <p className='text-xs font-bold tracking-[0.14em] text-muted uppercase'>{g.culture}</p>
              <h2 className='font-display font-semibold text-4xl'>{g.title}</h2>
              <ul className='flex flex-col gap-3 text-mauve leading-relaxed'>
                {g.customs.map(c => <li key={c} className='flex gap-3'><span className='mt-2.5 w-1.5 h-1.5 rounded-full bg-berry shrink-0'></span>{c}</li>)}
              </ul>
            </div>
            <div className={`${g.tint} p-7 sm:p-10 flex flex-col gap-4`}>
              <p className='font-bold'>Gift ideas</p>
              <ul className='flex flex-col gap-2'>
                {g.ideas.map(idea => <li key={idea} className='flex items-center gap-2 text-sm'><Icon name='check' size={16} className='text-berry' strokeWidth={2.2} />{idea}</li>)}
              </ul>
              <Link to={`/collection?sub=${g.sub}`} className='btn-primary self-start mt-auto'>Shop {g.title.toLowerCase()} <Icon name='arrow' size={18} /></Link>
            </div>
          </section>
        ))}
      </div>

      <section className='shell pt-12'>
        <div className='rounded-[28px] bg-gradient-to-br from-berry-dark via-[#9A2459] to-[#5E1238] text-[#F6E9EE] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div>
            <p className='font-display text-3xl sm:text-4xl text-white'>Planning a function or party?</p>
            <p className='mt-2 text-[#F8CFE1] max-w-2xl'>Birthday parties, house openings, poruwa ceremonies, pirith, almsgivings and office events — tell us the date, guest count and budget and we'll put together cakes, return gifts and décor for you.</p>
          </div>
          <button onClick={() => openChat('Birthday or party gifts')} className='btn-primary !bg-white !text-ink shrink-0'>Plan it with us</button>
        </div>
        <p className='text-xs text-muted mt-4'>Customs vary between families and regions — when in doubt, ask the host or chat with us and we'll help you choose.</p>
      </section>
    </div>
  )
}

export default GiftGuide
