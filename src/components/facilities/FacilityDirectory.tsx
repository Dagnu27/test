import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MapPin,
  Phone,
  User,
  Award,
  Calendar,
  ExternalLink,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';
import { Facility, LicenseStatus } from '../../types';

export const FacilityDirectory: React.FC = () => {
  const { facilities, facilityTypes, addFacility, setActiveView, setCurrentInspection } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectFacility, setInspectFacility] = useState<Facility | null>(null);

  // New facility form state
  const [formData, setFormData] = useState<Partial<Facility>>({
    facilityTypeId: 'pharmacy',
    name: '',
    region: 'Addis Ababa',
    zone: '',
    woreda: '',
    town: '',
    kebele: '',
    houseNo: '',
    phone: '+251 ',
    ownerName: '',
    technicalManager: '',
    professionalLevelTM: '',
    licenseNo: '',
    licenseStatus: 'VALID',
    licenseIssueDate: new Date().toISOString().split('T')[0],
    hasTradeLicense: true,
    latitude: 9.0125,
    longitude: 38.7612,
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser/device.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
        }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(`GPS access error: ${err.message}. Using default regional coordinates.`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.technicalManager || !formData.licenseNo) {
      alert('Please fill in required fields: Facility Name, Technical Manager, and License No.');
      return;
    }
    const created = addFacility(formData);
    setShowAddModal(false);
    // Reset
    setFormData({
      facilityTypeId: 'pharmacy',
      name: '',
      region: 'Addis Ababa',
      zone: '',
      woreda: '',
      town: '',
      kebele: '',
      houseNo: '',
      phone: '+251 ',
      ownerName: '',
      technicalManager: '',
      professionalLevelTM: '',
      licenseNo: '',
      licenseStatus: 'VALID',
      licenseIssueDate: new Date().toISOString().split('T')[0],
      hasTradeLicense: true,
      latitude: 9.0125,
      longitude: 38.7612,
    });
  };

  const startInspectionForFacility = (facility: Facility) => {
    setCurrentInspection(null);
    localStorage.setItem('dhris_selected_facility_id', facility.id);
    setActiveView('new_inspection');
  };

  // Filter facilities
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.facilityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.technicalManager.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || f.facilityTypeId === selectedType;
    const matchesRegion = selectedRegion === 'ALL' || f.region === selectedRegion;

    return matchesSearch && matchesType && matchesRegion;
  });

  const regions = Array.from(new Set(facilities.map((f) => f.region))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Healthcare Facilities Central Registry
          </h2>
          <p className="text-xs text-slate-500">
            Registered Community Pharmacies, Medium Clinics, and Dental Clinics under regulatory oversight
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Facility
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by facility name, code, license number, or technical manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            {facilityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium ml-2">
            <span>Region:</span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Regions</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((fac) => {
          const type = facilityTypes.find((t) => t.id === fac.facilityTypeId);

          return (
            <div
              key={fac.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {type?.name || 'Healthcare Facility'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">{fac.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{fac.facilityCode}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      fac.licenseStatus === 'VALID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : fac.licenseStatus === 'PROVISIONAL'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {fac.licenseStatus}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <strong>TM:</strong> {fac.technicalManager} ({fac.professionalLevelTM || 'Licensed'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {fac.region}, {fac.zone}, {fac.woreda} ({fac.houseNo ? `H.No ${fac.houseNo}` : 'N/A'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{fac.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">
                      Lic: {fac.licenseNo} (issued {fac.licenseIssueDate})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      GPS: {fac.latitude.toFixed(4)}°, {fac.longitude.toFixed(4)}°
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setInspectFacility(fac)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => startInspectionForFacility(fac)}
                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Inspect Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-medium">No healthcare facilities found matching the filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('ALL');
              setSelectedRegion('ALL');
            }}
            className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Facility Details Modal */}
      {inspectFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{inspectFacility.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Code: {inspectFacility.facilityCode}</p>
              </div>
              <button
                onClick={() => setInspectFacility(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Facility Type</span>
                  <span className="font-semibold text-slate-900">
                    {facilityTypes.find((t) => t.id === inspectFacility.facilityTypeId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Status</span>
                  <span className="font-semibold text-emerald-600">{inspectFacility.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Technical Manager</span>
                  <span className="font-semibold text-slate-900">{inspectFacility.technicalManager}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Professional Qualification</span>
                  <span className="font-semibold text-slate-900">{inspectFacility.professionalLevelTM}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner(s) Name</span>
                  <span className="font-semibold text-slate-900">{inspectFacility.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Trade License</span>
                  <span className="font-semibold text-slate-900">
                    {inspectFacility.hasTradeLicense ? 'Yes (Verified)' : 'No'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Physical Location & Address (Form 002 Sec 5.6)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Region</span>
                    <span className="font-medium text-slate-900">{inspectFacility.region}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Zone</span>
                    <span className="font-medium text-slate-900">{inspectFacility.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Woreda</span>
                    <span className="font-medium text-slate-900">{inspectFacility.woreda}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Town / Kebele</span>
                    <span className="font-medium text-slate-900">
                      {inspectFacility.town} / {inspectFacility.kebele}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">House Number</span>
                    <span className="font-medium text-slate-900">{inspectFacility.houseNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-medium text-slate-900">{inspectFacility.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Geographic Coordinates (GPS)
                </h4>
                <div className="flex items-center justify-between bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-emerald-900">
                      Lat: {inspectFacility.latitude}°, Lng: {inspectFacility.longitude}°
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${inspectFacility.latitude},${inspectFacility.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open in Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectFacility(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectFacility;
                  setInspectFacility(null);
                  startInspectionForFacility(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                Start Regulatory Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold text-base">Register New Health Facility</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facility Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.facilityTypeId}
                    onChange={(e) => setFormData({ ...formData, facilityTypeId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    {facilityTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facility Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Selam Community Pharmacy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Technical Manager / Head Professional <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pharm. Meron Assefa"
                    value={formData.technicalManager}
                    onChange={(e) => setFormData({ ...formData, technicalManager: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Professional Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Licensed Pharmacist / General Practitioner"
                    value={formData.professionalLevelTM}
                    onChange={(e) => setFormData({ ...formData, professionalLevelTM: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Facility Owner(s) Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ato Yohannes Gebremariam"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Regulatory License Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EFDA/CP/2023/0481"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Location & Contact Details
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Addis Ababa / Oromia"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Zone / Sub-City</label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Sub-City"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Woreda</label>
                    <input
                      type="text"
                      placeholder="e.g. Woreda 03"
                      value={formData.woreda}
                      onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Kebele / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Kebele 07"
                      value={formData.kebele}
                      onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">House Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 142/B"
                      value={formData.houseNo}
                      onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+251 11 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* GPS Geolocation Acquisition */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    GPS Geolocation Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gpsLoading}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? 'Acquiring GPS...' : 'Capture Current Location'}
                  </button>
                </div>

                {gpsError && <p className="text-xs text-amber-600">{gpsError}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-6 -mb-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs cursor-pointer"
                >
                  Save & Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
