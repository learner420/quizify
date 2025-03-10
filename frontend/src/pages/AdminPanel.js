import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Tabs, Tab, Modal, InputGroup, Badge } from 'react-bootstrap';
import API_URL, { apiCall } from '../api-config';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [tokenPackages, setTokenPackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkTokenModal, setShowBulkTokenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenValue, setTokenValue] = useState('');
  const [tokenAdjustment, setTokenAdjustment] = useState('add');
  const [tokenAmount, setTokenAmount] = useState('10');
  const [roleValue, setRoleValue] = useState('');
  const [bulkTokenAmount, setBulkTokenAmount] = useState('10');
  const [bulkTokenOperation, setBulkTokenOperation] = useState('add');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Package edit state
  const [editingPackages, setEditingPackages] = useState(false);
  const [packageEdits, setPackageEdits] = useState({});
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageAmount, setNewPackageAmount] = useState('');
  const [newPackageTokens, setNewPackageTokens] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching admin data from:', API_URL);
        
        // Fetch users
        const usersData = await apiCall('/api/admin/users');
        setUsers(usersData.users || []);
        
        // Fetch token packages
        const packagesData = await apiCall('/api/admin/token-packages');
        setTokenPackages(packagesData.packages || {});
        setPackageEdits(packagesData.packages || {});
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle user search
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Handle token adjustment
  const handleTokenAdjustment = async () => {
    if (!selectedUser || !tokenAmount) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Adjusting tokens for user using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/adjust-tokens', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedUser.id,
          operation: tokenAdjustment,
          amount: parseInt(tokenAmount)
        })
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, tokens: response.new_token_balance } 
          : user
      ));
      
      setSuccess(`Successfully ${tokenAdjustment === 'add' ? 'added' : 'removed'} ${tokenAmount} tokens for ${selectedUser.username}`);
      setShowTokenModal(false);
    } catch (err) {
      console.error('Error adjusting tokens:', err);
      setError('Failed to adjust tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !roleValue) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Changing role for user using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/change-role', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedUser.id,
          new_role: roleValue
        })
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: roleValue } 
          : user
      ));
      
      setSuccess(`Successfully changed role for ${selectedUser.username} to ${roleValue}`);
      setShowRoleModal(false);
    } catch (err) {
      console.error('Error changing role:', err);
      setError('Failed to change role. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle bulk token adjustment
  const handleBulkTokenAdjustment = async () => {
    if (selectedUsers.length === 0 || !bulkTokenAmount) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Adjusting tokens in bulk using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/bulk-adjust-tokens', {
        method: 'POST',
        body: JSON.stringify({
          user_ids: selectedUsers,
          operation: bulkTokenOperation,
          amount: parseInt(bulkTokenAmount)
        })
      });
      
      // Update the users in the list
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) 
          ? { ...user, tokens: response.updated_users[user.id] || user.tokens } 
          : user
      ));
      
      setSuccess(`Successfully ${bulkTokenOperation === 'add' ? 'added' : 'removed'} ${bulkTokenAmount} tokens for ${selectedUsers.length} users`);
      setShowBulkTokenModal(false);
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error adjusting tokens in bulk:', err);
      setError('Failed to adjust tokens in bulk. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle package updates
  const handleSavePackages = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Updating token packages using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/update-packages', {
        method: 'POST',
        body: JSON.stringify({
          packages: packageEdits
        })
      });
      
      setTokenPackages(response.packages || packageEdits);
      setSuccess('Token packages updated successfully');
      setEditingPackages(false);
    } catch (err) {
      console.error('Error updating packages:', err);
      setError('Failed to update token packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new package
  const handleAddPackage = async () => {
    if (!newPackageName || !newPackageAmount || !newPackageTokens) {
      setError('Please fill in all fields for the new package');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Adding new token package using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/add-package', {
        method: 'POST',
        body: JSON.stringify({
          name: newPackageName,
          amount: parseFloat(newPackageAmount),
          tokens: parseInt(newPackageTokens)
        })
      });
      
      // Update packages
      setTokenPackages(response.packages || {
        ...tokenPackages,
        [response.package_id]: {
          name: newPackageName,
          amount: parseFloat(newPackageAmount),
          tokens: parseInt(newPackageTokens)
        }
      });
      
      // Reset form
      setNewPackageName('');
      setNewPackageAmount('');
      setNewPackageTokens('');
      
      setSuccess('New token package added successfully');
    } catch (err) {
      console.error('Error adding package:', err);
      setError('Failed to add new token package. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a package
  const handleDeletePackage = async (packageId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Deleting token package using API URL:', API_URL);
      
      const response = await apiCall('/api/admin/delete-package', {
        method: 'POST',
        body: JSON.stringify({
          package_id: packageId
        })
      });
      
      // Remove package from state
      const updatedPackages = { ...tokenPackages };
      delete updatedPackages[packageId];
      setTokenPackages(updatedPackages);
      
      setSuccess('Token package deleted successfully');
    } catch (err) {
      console.error('Error deleting package:', err);
      setError('Failed to delete token package. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Token management
  const openTokenModal = (user) => {
    setSelectedUser(user);
    setTokenValue(user.tokens.toString());
    setTokenAmount('10');
    setTokenAdjustment('add');
    setShowTokenModal(true);
  };
  
  // Role management
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleValue(user.role);
    setShowRoleModal(true);
  };
  
  // Bulk token management
  const openBulkTokenModal = () => {
    setBulkTokenAmount('10');
    setBulkTokenOperation('add');
    setShowBulkTokenModal(true);
  };
  
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };
  
  // Package management
  const handlePackageChange = (packageName, field, value) => {
    setPackageEdits({
      ...packageEdits,
      [packageName]: {
        ...packageEdits[packageName],
        [field]: field === 'amount' ? parseFloat(value) : parseInt(value) || 0
      }
    });
  };
  
  const cancelPackageEdit = () => {
    setEditingPackages(false);
    setPackageEdits(tokenPackages);
    setNewPackageName('');
    setNewPackageAmount('');
    setNewPackageTokens('');
  };
  
  if (loading) {
    return (
      <Container className="py-4">
        <h1>Admin Panel</h1>
        <p>Loading admin data...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Admin Panel</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tabs defaultActiveKey="users" className="mb-4">
        <Tab eventKey="users" title="User Management">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>User Management</h2>
                <Button 
                  variant="primary" 
                  onClick={openBulkTokenModal}
                >
                  Bulk Token Management
                </Button>
              </div>
              
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search users by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users Only</option>
                    <option value="admin">Admins Only</option>
                  </Form.Select>
                </Col>
              </Row>
              
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={selectAllUsers}
                          label=""
                        />
                      </th>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Tokens</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            label=""
                          />
                        </td>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={user.tokens > 0 ? "success" : "danger"} pill>
                            {user.tokens}
                          </Badge>
                        </td>
                        <td>
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => openTokenModal(user)}
                          >
                            Edit Tokens
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => openRoleModal(user)}
                            disabled={user.id === currentUser.id} // Can't change own role
                          >
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-3">
                  <p>No users found matching your search criteria.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="packages" title="Token Packages">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Token Packages</h2>
                {!editingPackages ? (
                  <Button 
                    variant="primary" 
                    onClick={() => setEditingPackages(true)}
                  >
                    Edit Packages
                  </Button>
                ) : (
                  <div>
                    <Button 
                      variant="success" 
                      onClick={handleSavePackages}
                      className="me-2"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={cancelPackageEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="table-responsive">
                <Table striped>
                  <thead>
                    <tr>
                      <th>Package Name</th>
                      <th>Amount (₹)</th>
                      <th>Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(editingPackages ? packageEdits : tokenPackages).map(([name, pkg]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>
                          {editingPackages ? (
                            <Form.Control
                              type="number"
                              value={pkg.amount}
                              onChange={(e) => handlePackageChange(name, 'amount', e.target.value)}
                              min="0"
                            />
                          ) : (
                            `₹${pkg.amount}`
                          )}
                        </td>
                        <td>
                          {editingPackages ? (
                            <Form.Control
                              type="number"
                              value={pkg.tokens}
                              onChange={(e) => handlePackageChange(name, 'tokens', e.target.value)}
                              min="0"
                            />
                          ) : (
                            pkg.tokens
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {editingPackages && (
                      <tr>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="New package name"
                            value={newPackageName}
                            onChange={(e) => setNewPackageName(e.target.value)}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            placeholder="Amount"
                            value={newPackageAmount}
                            onChange={(e) => setNewPackageAmount(e.target.value)}
                            min="0"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            placeholder="Tokens"
                            value={newPackageTokens}
                            onChange={(e) => setNewPackageTokens(e.target.value)}
                            min="0"
                          />
                        </td>
                        <td>
                          <Button 
                            variant="success" 
                            onClick={handleAddPackage}
                          >
                            Add Package
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Token Edit Modal */}
      <Modal show={showTokenModal} onHide={() => setShowTokenModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Tokens for {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Tokens: {selectedUser?.tokens}</Form.Label>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  label="Set exact token amount"
                  name="tokenAdjustment"
                  id="set-tokens"
                  checked={tokenAdjustment === 'set'}
                  onChange={() => setTokenAdjustment('set')}
                  className="mb-2"
                />
                {tokenAdjustment === 'set' && (
                  <Form.Control
                    type="number"
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                    min="0"
                    className="ms-4 mb-3"
                  />
                )}
                
                <Form.Check
                  type="radio"
                  label="Add tokens"
                  name="tokenAdjustment"
                  id="add-tokens"
                  checked={tokenAdjustment === 'add'}
                  onChange={() => setTokenAdjustment('add')}
                  className="mb-2"
                />
                {tokenAdjustment === 'add' && (
                  <Form.Control
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    min="1"
                    className="ms-4 mb-3"
                  />
                )}
                
                <Form.Check
                  type="radio"
                  label="Subtract tokens"
                  name="tokenAdjustment"
                  id="subtract-tokens"
                  checked={tokenAdjustment === 'subtract'}
                  onChange={() => setTokenAdjustment('subtract')}
                  className="mb-2"
                />
                {tokenAdjustment === 'subtract' && (
                  <Form.Control
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    min="1"
                    max={selectedUser?.tokens || 0}
                    className="ms-4"
                  />
                )}
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>New Token Balance: </strong>
                {tokenAdjustment === 'set' 
                  ? parseInt(tokenValue) || 0
                  : tokenAdjustment === 'add'
                    ? (selectedUser?.tokens || 0) + (parseInt(tokenAmount) || 0)
                    : Math.max(0, (selectedUser?.tokens || 0) - (parseInt(tokenAmount) || 0))
                }
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTokenModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleTokenAdjustment}>
            Update Tokens
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Bulk Token Modal */}
      <Modal show={showBulkTokenModal} onHide={() => setShowBulkTokenModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Token Management</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select users and apply token changes to all selected users at once.</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Token Operation</Form.Label>
            <div className="mb-3">
              <Form.Check
                type="radio"
                label="Set exact token amount for all selected users"
                name="bulkTokenOperation"
                id="bulk-set-tokens"
                checked={bulkTokenOperation === 'set'}
                onChange={() => setBulkTokenOperation('set')}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="Add tokens to all selected users"
                name="bulkTokenOperation"
                id="bulk-add-tokens"
                checked={bulkTokenOperation === 'add'}
                onChange={() => setBulkTokenOperation('add')}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="Subtract tokens from all selected users"
                name="bulkTokenOperation"
                id="bulk-subtract-tokens"
                checked={bulkTokenOperation === 'subtract'}
                onChange={() => setBulkTokenOperation('subtract')}
                className="mb-2"
              />
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Token Amount</Form.Label>
            <Form.Control
              type="number"
              value={bulkTokenAmount}
              onChange={(e) => setBulkTokenAmount(e.target.value)}
              min="0"
            />
          </Form.Group>
          
          <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <Table striped hover>
              <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      label=""
                    />
                  </th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Current Tokens</th>
                  <th>New Tokens</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  let newTokens;
                  if (bulkTokenOperation === 'set') {
                    newTokens = parseInt(bulkTokenAmount) || 0;
                  } else if (bulkTokenOperation === 'add') {
                    newTokens = user.tokens + (parseInt(bulkTokenAmount) || 0);
                  } else {
                    newTokens = Math.max(0, user.tokens - (parseInt(bulkTokenAmount) || 0));
                  }
                  
                  return (
                    <tr key={user.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          label=""
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.tokens}</td>
                      <td>
                        <Badge bg={newTokens > user.tokens ? "success" : newTokens < user.tokens ? "danger" : "secondary"}>
                          {newTokens}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="mt-3 text-center">
              <Badge bg="primary">{selectedUsers.length} users selected</Badge>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkTokenModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkTokenAdjustment}
            disabled={selectedUsers.length === 0}
          >
            Apply to {selectedUsers.length} Users
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Role Edit Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Role for {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRoleChange}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel; 
