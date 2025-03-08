import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Tabs, Tab, Modal, InputGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
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
        
        // Fetch users
        const usersResponse = await axios.get('/api/admin/users');
        setUsers(usersResponse.data.users);
        
        // Fetch token packages
        const packagesResponse = await axios.get('/api/admin/token-packages');
        setTokenPackages(packagesResponse.data.packages);
        setPackageEdits(packagesResponse.data.packages);
      } catch (err) {
        setError('Failed to load admin data: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Token management
  const openTokenModal = (user) => {
    setSelectedUser(user);
    setTokenValue(user.tokens.toString());
    setTokenAmount('10');
    setTokenAdjustment('add');
    setShowTokenModal(true);
  };
  
  const updateUserTokens = async () => {
    try {
      setError('');
      
      let newTokenValue;
      if (tokenAdjustment === 'set') {
        newTokenValue = parseInt(tokenValue);
      } else if (tokenAdjustment === 'add') {
        newTokenValue = selectedUser.tokens + parseInt(tokenAmount);
      } else if (tokenAdjustment === 'subtract') {
        newTokenValue = Math.max(0, selectedUser.tokens - parseInt(tokenAmount));
      }
      
      const response = await axios.put(`/api/admin/users/${selectedUser.id}/tokens`, {
        tokens: newTokenValue
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, tokens: response.data.user.tokens } 
          : user
      ));
      
      setSuccess(`Tokens updated for ${selectedUser.username} to ${response.data.user.tokens}`);
      setShowTokenModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update tokens: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Bulk token management
  const openBulkTokenModal = () => {
    setSelectedUsers([]);
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
  
  const updateBulkTokens = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    try {
      setError('');
      let successCount = 0;
      
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;
        
        let newTokenValue;
        if (bulkTokenOperation === 'set') {
          newTokenValue = parseInt(bulkTokenAmount);
        } else if (bulkTokenOperation === 'add') {
          newTokenValue = user.tokens + parseInt(bulkTokenAmount);
        } else if (bulkTokenOperation === 'subtract') {
          newTokenValue = Math.max(0, user.tokens - parseInt(bulkTokenAmount));
        }
        
        const response = await axios.put(`/api/admin/users/${userId}/tokens`, {
          tokens: newTokenValue
        });
        
        // Update the user in the list
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, tokens: response.data.user.tokens } 
            : u
        ));
        
        successCount++;
      }
      
      setSuccess(`Tokens updated for ${successCount} users`);
      setShowBulkTokenModal(false);
      setSelectedUsers([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update tokens: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Role management
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleValue(user.role);
    setShowRoleModal(true);
  };
  
  const updateUserRole = async () => {
    try {
      setError('');
      
      const response = await axios.put(`/api/admin/users/${selectedUser.id}/role`, {
        role: roleValue
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: response.data.user.role } 
          : user
      ));
      
      setSuccess(`Role updated for ${selectedUser.username} to ${response.data.user.role}`);
      setShowRoleModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update role: ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Package management
  const handlePackageChange = (packageName, field, value) => {
    setPackageEdits({
      ...packageEdits,
      [packageName]: {
        ...packageEdits[packageName],
        [field]: parseInt(value) || 0
      }
    });
  };
  
  const addNewPackage = () => {
    if (!newPackageName || !newPackageAmount || !newPackageTokens) {
      setError('Please fill in all fields for the new package');
      return;
    }
    
    setPackageEdits({
      ...packageEdits,
      [newPackageName]: {
        amount: parseInt(newPackageAmount),
        tokens: parseInt(newPackageTokens)
      }
    });
    
    // Clear form
    setNewPackageName('');
    setNewPackageAmount('');
    setNewPackageTokens('');
  };
  
  const savePackageChanges = async () => {
    try {
      setError('');
      
      const response = await axios.put('/api/admin/token-packages', packageEdits);
      
      setTokenPackages(response.data.packages);
      setEditingPackages(false);
      setSuccess('Token packages updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update packages: ' + (err.response?.data?.error || err.message));
    }
  };
  
  const cancelPackageEdit = () => {
    setPackageEdits(tokenPackages);
    setEditingPackages(false);
    setNewPackageName('');
    setNewPackageAmount('');
    setNewPackageTokens('');
  };
  
  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
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
                      onClick={savePackageChanges}
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
                            onClick={addNewPackage}
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
          <Button variant="primary" onClick={updateUserTokens}>
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
            onClick={updateBulkTokens}
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
          <Button variant="primary" onClick={updateUserRole}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel; 